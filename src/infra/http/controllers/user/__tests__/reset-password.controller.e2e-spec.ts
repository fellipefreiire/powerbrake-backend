import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { UserFactory } from 'test/factories/make-user'
import { TokenService } from '@/infra/auth/token.service'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { RateLimitService } from '@/shared/rate-limit/rate-limit.service'

describe('Reset Password (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let tokenService: TokenService
  let rateLimitService: RateLimitService

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
  })

  it('[204] Success → should reset the password with valid token', async () => {
    const user = await userFactory.makePrismaUser({
      email: 'reset@example.com',
    })

    const token = await tokenService.generate({
      sub: user.id.toString(),
    })

    const response = await request(app.getHttpServer())
      .post('/v1/users/reset-password')
      .send({
        token,
        password: 'NovaSenha@123',
      })

    expect(response.statusCode).toBe(204)
  })

  it('[401] Unauthorized → should return 401 with invalid token', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/users/reset-password')
      .send({
        token: 'invalid.token',
        password: 'NovaSenha@123',
      })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Unauthorized',
      }),
    )
  })

  it('[404] Not Found → should return 404 if user does not exist', async () => {
    const fakeId = 'non-existent-id'
    const token = await tokenService.generate({ sub: fakeId })

    const response = await request(app.getHttpServer())
      .post('/v1/users/reset-password')
      .send({
        token,
        password: 'NovaSenha@123',
      })

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 404,
        error: 'Not Found',
        message: 'User not found',
      }),
    )
  })

  it('[400] Validation → should return 400 if required fields are missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/users/reset-password')
      .send({})

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: 'Missing required fields',
        error: 'Bad Request',
        errors: expect.objectContaining({
          name: 'ZodValidationError',
          details: expect.arrayContaining([
            expect.objectContaining({
              path: expect.arrayContaining(['token']),
            }),
            expect.objectContaining({
              path: expect.arrayContaining(['password']),
            }),
          ]),
        }),
      }),
    )
  })

  it('[429] should return 429 after exceeding rate limit', async () => {
    const user = await userFactory.makePrismaUser({
      email: 'reset429@example.com',
    })
    const token = await tokenService.generate({
      sub: user.id.toString(),
    })

    for (let i = 0; i < 3; i++) {
      await request(app.getHttpServer())
        .post('/v1/users/reset-password')
        .send({ token, password: 'NovaSenha@123' })
        .expect(204)
    }

    const response = await request(app.getHttpServer())
      .post('/v1/users/reset-password')
      .send({ token, password: 'NovaSenha@123' })
      .expect(429)

    expect(response.headers['retry-after']).toBeDefined()
  })
})
