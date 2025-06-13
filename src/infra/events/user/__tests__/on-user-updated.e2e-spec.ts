import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { UserFactory } from 'test/factories/make-user'
import { TokenService } from '@/infra/auth/token.service'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { randomUUID } from 'node:crypto'
import { DomainEvents } from '@/core/events/domain-events'
import { waitFor } from 'test/utils/wait-for'

describe('On user updated (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let tokenService: TokenService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, UserDatabaseModule, CryptographyModule],
      providers: [UserFactory, TokenService],
    }).compile()

    app = moduleRef.createNestApplication()
    app.enableVersioning({ type: VersioningType.URI })

    prisma = moduleRef.get(PrismaService)
    userFactory = moduleRef.get(UserFactory)
    tokenService = moduleRef.get(TokenService)

    DomainEvents.shouldRun = true

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "users" CASCADE')
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "audit_logs" CASCADE')
  })

  it('[EVENT] → should create audit log when user is updated', async () => {
    const user = await userFactory.makePrismaUser()
    const accessToken = await tokenService.generateAccessToken({
      sub: user.id.toString(),
      role: user.role,
      jti: randomUUID(),
    })

    const payload = {
      name: 'Updated Name',
      addresses: [
        {
          street: 'Rua Nova',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '12345-678',
        },
      ],
    }

    await request(app.getHttpServer())
      .patch(`/v1/users/${user.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken.token}`)
      .send(payload)
      .expect(200)

    await waitFor(async () => {
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          actorId: user.id.toString(),
          action: 'user:updated',
        },
      })

      expect(auditLog).not.toBeNull()
      expect(auditLog).toMatchObject({
        actorId: user.id.toString(),
        actorType: 'USER',
        action: 'user:updated',
        entity: 'USER',
        entityId: user.id.toString(),
      })
    })
  })
})
