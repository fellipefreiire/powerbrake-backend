import { DomainEvents } from '@/core/events/domain-events'
import { AppModule } from '@/infra/app.module'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { UserFactory } from 'test/factories/make-user'
import request from 'supertest'
import { hash } from 'bcryptjs'
import { waitFor } from 'test/utils/wait-for'

describe('On user logged in (E2E)', () => {
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

  it('[EVENT] → should create audit log when user logs in', async () => {
    const password = '123456'
    const user = await userFactory.makePrismaUser({
      passwordHash: await hash(password, 8),
    })

    const response = await request(app.getHttpServer())
      .post('/v1/users/login')
      .send({
        email: user.email,
        password,
      })

    expect(response.statusCode).toBe(200)

    await waitFor(async () => {
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          actorId: user.id.toString(),
          action: 'user:logged_in',
        },
      })

      expect(auditLog).not.toBeNull()
      expect(auditLog).toMatchObject({
        actorId: user.id.toString(),
        actorType: 'USER',
        action: 'user:logged_in',
        entity: 'USER',
        entityId: user.id.toString(),
      })
    })
  })
})
