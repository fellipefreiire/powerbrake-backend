import { DomainEvents } from '@/core/events/domain-events'
import { AppModule } from '@/infra/app.module'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { TokenService } from '@/infra/auth/token.service'
import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { UserFactory } from 'test/factories/make-user'
import { randomUUID } from 'crypto'
import request from 'supertest'
import { hash } from 'bcryptjs'
import { waitFor } from 'test/utils/wait-for'

describe('On user password changed (E2E)', () => {
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

  it('[EVENT] → should create audit log when user changes password', async () => {
    const password = '12345678'
    const user = await userFactory.makePrismaUser({
      passwordHash: await hash(password, 8),
    })

    const token = await tokenService.generate({
      sub: user.id.toString(),
      role: user.role,
      jti: randomUUID(),
    })

    await request(app.getHttpServer())
      .patch(`/v1/users/${user.id.toString()}/password`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: password,
        newPassword: 'new-password',
      })
      .expect(204)

    await waitFor(async () => {
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          actorId: user.id.toString(),
          action: 'user:password_changed',
        },
      })

      expect(auditLog).not.toBeNull()
      expect(auditLog?.changes).toContain('passwordChanged')
    })
  })
})
