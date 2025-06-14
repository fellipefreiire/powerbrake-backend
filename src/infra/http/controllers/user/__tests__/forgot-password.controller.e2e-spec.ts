import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { UserFactory } from 'test/factories/make-user'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { RateLimitService } from '@/shared/rate-limit/rate-limit.service'
import type { User } from '@/domain/user/enterprise/entities/user'

describe('Forgot Password (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let rateLimitService: RateLimitService
  let adminUser: User

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
    rateLimitService = app.get(RateLimitService)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "users" RESTART IDENTITY CASCADE',
    )
    rateLimitService.clearAll()

    adminUser = await userFactory.makePrismaUser({
      email: 'johndoe@example.com',
      role: 'ADMIN',
    })
  })

  afterEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "users" RESTART IDENTITY CASCADE',
    )
  })

  it('[204] Success → should return 204 even if user exists or not', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/users/forgot-password')
      .send({ email: adminUser.email })

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

  it('[429] should return 429 after exceeding rate limit', async () => {
    for (let i = 0; i < 3; i++) {
      await request(app.getHttpServer())
        .post('/v1/users/forgot-password')
        .send({ email: adminUser.email })
    }

    const response = await request(app.getHttpServer())
      .post('/v1/users/forgot-password')
      .send({ email: adminUser.email })
      .expect(429)
    expect(response.headers['retry-after']).toBeDefined()
  })
})
