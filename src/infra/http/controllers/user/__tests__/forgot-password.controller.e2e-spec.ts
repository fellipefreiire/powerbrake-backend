import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { UserFactory } from 'test/factories/make-user'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('Forgot Password (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, UserDatabaseModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    app.enableVersioning({
      type: VersioningType.URI,
    })

    prisma = moduleRef.get(PrismaService)
    userFactory = moduleRef.get(UserFactory)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "users" RESTART IDENTITY CASCADE',
    )
  })

  afterEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "users" RESTART IDENTITY CASCADE',
    )
  })

  it('[204] Success → should return 204 even if user exists or not', async () => {
    await userFactory.makePrismaUser({
      email: 'user@example.com',
    })

    const response = await request(app.getHttpServer())
      .post('/v1/users/forgot-password')
      .send({ email: 'user@example.com' })

    expect(response.statusCode).toBe(204)
  })

  it('[204] Success → should return 204 even if user does NOT exist', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/users/forgot-password')
      .send({ email: 'nonexistent@example.com' })

    expect(response.statusCode).toBe(204)
  })

  it('[400] Validation → should return 400 if email is missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/users/forgot-password')
      .send({})

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 400,
        error: 'Bad Request',
      }),
    )
  })

  it('[422] Validation → should return 422 if email is invalid format', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/users/forgot-password')
      .send({ email: 'invalid-email-format' })

    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 422,
        error: 'Unprocessable Entity',
        message: expect.any(String),
      }),
    )
  })
})
