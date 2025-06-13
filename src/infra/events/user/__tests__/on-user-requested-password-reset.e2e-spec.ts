import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { UserFactory } from 'test/factories/make-user'
import { waitFor } from 'test/utils/wait-for'
import { DomainEvents } from '@/core/events/domain-events'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'

describe('On User Requested Password Reset (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, UserDatabaseModule, CryptographyModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    app.enableVersioning({ type: VersioningType.URI })

    prisma = moduleRef.get(PrismaService)
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

  it('[EVENT] → should create audit log when user requests password reset', async () => {
    const user = await userFactory.makePrismaUser()

    const response = await request(app.getHttpServer())
      .post('/v1/users/forgot-password')
      .send({
        email: user.email,
      })

    expect(response.statusCode).toBe(204)

    await waitFor(async () => {
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          actorId: user.id.toString(),
          action: 'user:requested_password_reset',
        },
      })

      expect(auditLog).not.toBeNull()
      expect(auditLog).toMatchObject({
        actorId: user.id.toString(),
        actorType: 'USER',
        action: 'user:requested_password_reset',
        entity: 'USER',
        entityId: user.id.toString(),
      })
    })
  })
})
