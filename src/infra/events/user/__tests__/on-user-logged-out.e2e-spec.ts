import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { TokenService } from '@/infra/auth/token.service'
import { UserFactory } from 'test/factories/make-user'
import { waitFor } from 'test/utils/wait-for'
import { DomainEvents } from '@/core/events/domain-events'
import { randomUUID } from 'node:crypto'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'

describe('On User Logged Out (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let tokenService: TokenService
  let userFactory: UserFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, UserDatabaseModule, CryptographyModule],
      providers: [UserFactory, TokenService],
    }).compile()

    app = moduleRef.createNestApplication()
    app.enableVersioning({ type: VersioningType.URI })

    prisma = moduleRef.get(PrismaService)
    tokenService = moduleRef.get(TokenService)
    userFactory = moduleRef.get(UserFactory)

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

  it('[EVENT] → should create audit log when user logs out', async () => {
    const user = await userFactory.makePrismaUser()

    const accessToken = await tokenService.generateAccessToken({
      sub: user.id.toString(),
      role: user.role,
      jti: randomUUID(),
    })

    const response = await request(app.getHttpServer())
      .post('/v1/users/logout')
      .set('Authorization', `Bearer ${accessToken.token}`)
      .send()

    expect(response.statusCode).toBe(204)

    await waitFor(async () => {
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          actorId: user.id.toString(),
          action: 'user:logged_out',
        },
      })

      expect(auditLog).not.toBeNull()
      expect(auditLog).toMatchObject({
        actorId: user.id.toString(),
        actorType: 'USER',
        action: 'user:logged_out',
        entity: 'USER',
        entityId: user.id.toString(),
      })
    })
  })
})
