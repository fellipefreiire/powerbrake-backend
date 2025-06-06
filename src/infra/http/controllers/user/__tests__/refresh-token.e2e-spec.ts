import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { UserFactory } from 'test/factories/make-user'
import { RefreshTokenRepository } from '@/infra/auth/refresh-token.repository'
import type { User } from '@/domain/user/enterprise/entities/user'
import { randomUUID } from 'node:crypto'

const refreshTokenEndpoint = '/v1/users/refresh'

describe('Refresh Token (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let refreshTokenRepository: RefreshTokenRepository
  let adminUser: User
  let jwt: JwtService

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
    refreshTokenRepository = moduleRef.get(RefreshTokenRepository)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "users" RESTART IDENTITY CASCADE',
    )

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

  it('[200] OK → should return new access token from valid refresh token', async () => {
    const jti = await refreshTokenRepository.create(adminUser.id.toString())

    const refreshToken = jwt.sign(
      {
        sub: adminUser.id.toString(),
        role: adminUser.role,
        jti,
      },
      { algorithm: 'RS256' },
    )

    const response = await request(app.getHttpServer())
      .post(refreshTokenEndpoint)
      .set('Authorization', `Bearer ${refreshToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      access_token: expect.objectContaining({
        expiresIn: expect.any(Number),
        token: expect.any(String),
      }),
      refresh_token: expect.objectContaining({
        token: expect.any(String),
      }),
      expiresIn: expect.any(Number),
    })
  })

  it('[401] Unauthorized → should return error for invalid refresh token', async () => {
    const response = await request(app.getHttpServer())
      .post(refreshTokenEndpoint)
      .set('Authorization', 'Bearer invalid.token.here')

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Unauthorized',
      }),
    )
  })

  it('[401] Unauthorized → should return error for expired refresh token', async () => {
    const jti = await refreshTokenRepository.create(adminUser.id.toString())

    const expiredToken = jwt.sign(
      {
        sub: adminUser.id.toString(),
        role: adminUser.role,
        jti,
        exp: Math.floor(Date.now() / 1000) - 10,
        iat: Math.floor(Date.now() / 1000) - 20,
      },
      { algorithm: 'RS256' },
    )

    const response = await request(app.getHttpServer())
      .post(refreshTokenEndpoint)
      .set('Authorization', `Bearer ${expiredToken}`)

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Unauthorized',
      }),
    )
  })

  it('[401] Unauthorized → should return error if jti not found in repository', async () => {
    const fakeJti = randomUUID()

    const fakeToken = jwt.sign(
      {
        sub: adminUser.id.toString(),
        role: adminUser.role,
        jti: fakeJti,
        exp: Math.floor(Date.now() / 1000) + 60 * 10,
        iat: Math.floor(Date.now() / 1000),
      },
      { algorithm: 'RS256' },
    )

    const response = await request(app.getHttpServer())
      .post(refreshTokenEndpoint)
      .set('Authorization', `Bearer ${fakeToken}`)

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Unauthorized',
      }),
    )
  })

  it('[401] Unauthorized → should return error if no Authorization header is sent', async () => {
    const response = await request(app.getHttpServer()).post(
      refreshTokenEndpoint,
    )

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Unauthorized',
      }),
    )
  })
})
