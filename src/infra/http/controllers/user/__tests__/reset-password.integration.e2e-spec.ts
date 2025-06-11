import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '@/infra/app.module'
import { UserFactory } from 'test/factories/make-user'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import request from 'supertest'
import { User } from '@/domain/user/enterprise/entities/user'
import { FakeMailer } from 'test/cryptography/fake-mailer'
import { MailRepository } from '@/infra/mail/mail-repository'

describe('Reset Password Flow (Integration)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let mailer: FakeMailer

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, UserDatabaseModule],
      providers: [UserFactory, FakeMailer],
    })
      .overrideProvider(MailRepository)
      .useClass(FakeMailer)
      .compile()

    app = moduleRef.createNestApplication()
    app.enableVersioning({
      type: VersioningType.URI,
    })

    prisma = moduleRef.get(PrismaService)
    userFactory = moduleRef.get(UserFactory)
    mailer = moduleRef.get(MailRepository) as FakeMailer

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "users" RESTART IDENTITY CASCADE',
    )
    mailer.sent.length = 0
  })

  it('should reset the password successfully', async () => {
    const user: User = await userFactory.makePrismaUser({
      email: 'example@email.com',
      passwordHash: 'old-password',
    })

    await request(app.getHttpServer())
      .post('/v1/users/forgot-password')
      .send({ email: user.email })
      .expect(204)

    expect(mailer.sent).toHaveLength(1)
    const html = mailer.sent[0].html
    const tokenMatch = html.match(/token=([a-zA-Z0-9._-]+)/)
    const token = tokenMatch?.[1]

    expect(token).toBeDefined()
    expect(token).toBeDefined()
    await request(app.getHttpServer())
      .post('/v1/users/reset-password')
      .send({
        token,
        password: 'new-password',
      })
      .expect(204)
    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id.toString() },
    })
    expect(updatedUser.passwordHash).not.toBe(user.passwordHash)
  })
})
