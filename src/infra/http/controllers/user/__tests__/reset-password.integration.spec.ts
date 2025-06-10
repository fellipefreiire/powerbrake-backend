import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { UserFactory } from 'test/factories/make-user'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { FakeMailer } from 'test/cryptography/fake-mailer'
import { MailRepository } from '@/infra/mail/mail-repository'
import { HashComparer } from '@/shared/cryptography/hash-comparer'

describe('Reset Password Flow (Integration)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let mailer: FakeMailer
  let hashComparer: HashComparer

  const resetPasswordUrl = 'https://example.com/reset-password'

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, UserDatabaseModule],
      providers: [UserFactory],
    })
      .overrideProvider(MailRepository)
      .useClass(FakeMailer)
      .compile()

    app = moduleRef.createNestApplication()
    app.enableVersioning({ type: VersioningType.URI })

    prisma = moduleRef.get(PrismaService)
    userFactory = moduleRef.get(UserFactory)
    mailer = moduleRef.get(MailRepository) as FakeMailer
    hashComparer = moduleRef.get(HashComparer)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "users" RESTART IDENTITY CASCADE',
    )
    mailer.sent = []
  })

  it('should reset the password successfully', async () => {
    const user = await userFactory.makePrismaUser({
      email: 'test@example.com',
      passwordHash: 'old-password',
    })

    await request(app.getHttpServer())
      .post('/v1/users/forgot-password')
      .send({
        email: user.email,
        resetPasswordUrl,
      })
      .expect(204)

    expect(mailer.sent).toHaveLength(1)
    const sentEmail = mailer.sent[0]

    const match = sentEmail.html.match(/token=([^"]+)/)
    expect(match).toBeTruthy()
    const token = decodeURIComponent(match![1])

    await request(app.getHttpServer())
      .post('/v1/users/reset-password')
      .send({
        token,
        password: 'new-password',
      })
      .expect(204)

    const updated = await prisma.user.findUnique({
      where: { id: user.id.toString() },
    })

    expect(updated).toBeTruthy()
    expect(updated!.passwordHash).not.toBe(user.passwordHash)

    const rehashed = await hashComparer.compare(
      'new-password',
      updated!.passwordHash,
    )
    expect(rehashed).toBe(true)
  })
})
