import { UserFactory } from 'test/factories/make-user'
import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '@/infra/app.module'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { TokenService } from '@/infra/auth/token.service'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import type { User } from '@/domain/user/enterprise/entities/user'
import { RateLimitService } from '@/shared/rate-limit/rate-limit.service'

const authenticateUserEndpoint = '/v1/users/login'

describe('Authenticate User (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let jwt: JwtService
  let adminUser: User
  let rateLimitService: RateLimitService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, UserDatabaseModule, CryptographyModule],
      providers: [UserFactory, TokenService],
    }).compile()

    app = moduleRef.createNestApplication()
    app.enableVersioning({
      type: VersioningType.URI,
    })

    prisma = moduleRef.get(PrismaService)
    userFactory = moduleRef.get(UserFactory)
    jwt = moduleRef.get(JwtService)
    rateLimitService = app.get(RateLimitService)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "users" CASCADE')
    rateLimitService.clearAll()

    adminUser = await userFactory.makePrismaUser({
      email: 'johndoe@example.com',
      role: 'ADMIN',
      passwordHash: await hash('123456', 8),
    })
  })

  afterEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "users" CASCADE')
  })

  describe(`[POST] ${authenticateUserEndpoint}`, async () => {
    it('[200] Success → Return token', async () => {
      const response = await request(app.getHttpServer())
        .post(authenticateUserEndpoint)
        .send({ email: adminUser.email, password: '123456' })

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({
        access_token: expect.objectContaining({
          expiresIn: expect.any(Number),
          token: expect.any(String),
        }),
        refresh_token: expect.objectContaining({
          expiresIn: expect.any(Number),
          token: expect.any(String),
        }),
        expiresIn: expect.any(Number),
      })

      const payload = jwt.verify(response.body.access_token.token)
      expect(payload.sub).toBe(adminUser.id.toString())
    })

    it('[400] Bad Request → Missing required fields', async () => {
      let response = await request(app.getHttpServer())
        .post(authenticateUserEndpoint)
        .send({ password: 'whatever123' })

      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          error: 'Bad Request',
          message: expect.stringMatching(/Missing required fields/),
        }),
      )

      response = await request(app.getHttpServer())
        .post(authenticateUserEndpoint)
        .send({ email: 'whatever@example.com' })

      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          error: 'Bad Request',
          message: expect.stringMatching(/Missing required fields/),
        }),
      )
    })

    it('[401] Unauthorized → Wrong credentials', async () => {
      const response = await request(app.getHttpServer())
        .post(authenticateUserEndpoint)
        .send({
          email: adminUser.email,
          password: 'WrongPass!',
        })

      expect(response.statusCode).toBe(401)
      expect(response.body).toEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Credentials are not valid.',
      })
    })

    it('[403] Forbidden → Inactive user', async () => {
      const user = await userFactory.makePrismaUser({
        isActive: false,
        passwordHash: await hash('123456', 8),
      })

      const response = await request(app.getHttpServer())
        .post(authenticateUserEndpoint)
        .send({ email: user.email, password: '123456' })

      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({
        statusCode: 403,
        error: 'Forbidden',
        message: 'User inactive',
      })
    })

    it('[422] Unprocessable Entity → Invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post(authenticateUserEndpoint)
        .send({ email: 'invalid-email', password: 'somePass123' })

      expect(response.statusCode).toBe(422)
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 422,
          error: 'Unprocessable Entity',
          message: 'Validation failed',
        }),
      )
    })

    it('[429] should return 429 after exceeding rate limit', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/v1/users/login')
          .send({ email: adminUser.email, password: 'errada' })
          .expect(401)
      }

      const response = await request(app.getHttpServer())
        .post('/v1/users/login')
        .send({ email: adminUser.email, password: 'errada' })
        .expect(429)
      expect(response.headers['retry-after']).toBeDefined()
    })
  })
})
