import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { UserFactory } from 'test/factories/make-user'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { RefreshTokenService } from '@/infra/auth/refresh-token.service'
import { JwtService } from '@nestjs/jwt'

describe('Logout User (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let refreshTokenService: RefreshTokenService
  let jwt: JwtService

  const endpoint = '/v1/users/logout'

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    app.enableVersioning({ type: VersioningType.URI })

    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)
    userFactory = moduleRef.get(UserFactory)
    refreshTokenService = moduleRef.get(RefreshTokenService)

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

  it('[204] OK → should logout user and revoke refresh token', async () => {
    const user = await userFactory.makePrismaUser()

    const jti = await refreshTokenService.create(user.id.toString())

    const now = Math.floor(Date.now() / 1000)
    const exp = now + 60 * 60 * 24 * 7 // 7 days

    const refreshToken = jwt.sign(
      {
        sub: user.id.toString(),
        role: user.role,
        jti,
        iat: now,
        exp,
      },
      { algorithm: 'RS256' },
    )

    const response = await request(app.getHttpServer())
      .post(endpoint)
      .set('Authorization', `Bearer ${refreshToken}`)

    expect(response.statusCode).toBe(204)
  })

  it('[401] Unauthorized → should fail without token', async () => {
    const response = await request(app.getHttpServer()).post(endpoint)

    expect(response.statusCode).toBe(401)
  })

  it('[401] Unauthorized → should fail with invalid token', async () => {
    const response = await request(app.getHttpServer())
      .post(endpoint)
      .set('Authorization', 'Bearer invalid.token.here')

    expect(response.statusCode).toBe(401)
  })
})
