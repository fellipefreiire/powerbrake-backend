import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '@/infra/app.module'
import request from 'supertest'
import { UserFactory } from 'test/factories/make-user'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import type { User } from '@/domain/user/enterprise/entities/user'
import { Role } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import { TokenService } from '@/infra/auth/token.service'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'

describe('Find User By Id (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let token: TokenService
  let adminUser: User
  let adminAccessToken: {
    token: string
    expiresIn: number
  }
  let operatorUser: User
  let operatorAccessToken: {
    token: string
    expiresIn: number
  }
  let targetUser: User

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
    token = moduleRef.get(TokenService)

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

    adminAccessToken = await token.generateAccessToken({
      sub: adminUser.id.toString(),
      role: adminUser.role,
    })

    operatorUser = await userFactory.makePrismaUser({
      email: 'operator.user@example.com',
      role: 'OPERATOR',
    })

    operatorAccessToken = await token.generateAccessToken({
      sub: operatorUser.id.toString(),
      role: operatorUser.role,
    })

    targetUser = await userFactory.makePrismaUser({
      name: 'Target User',
      email: 'target.user@example.com',
      role: 'OPERATOR',
    })
  })

  afterEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "users" RESTART IDENTITY CASCADE',
    )
  })

  describe('[GET] /v1/users/:id', async () => {
    it('[200] Success → should be able to find user by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/users/${targetUser.id.toString()}`)
        .set('Authorization', `Bearer ${adminAccessToken.token}`)

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({
        data: expect.objectContaining({
          id: targetUser.id.toString(),
          name: 'Target User',
          email: 'target.user@example.com',
          role: Role.OPERATOR,
          isActive: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      })
    })

    it('[400] Bad Request → should not be able to find user without the right id', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/users/invalid-uuid')
        .set('Authorization', `Bearer ${adminAccessToken.token}`)

      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Param id must be a valid UUID',
      })
    })

    it('[401] Unauthorized → should not be able to find user without token', async () => {
      const response = await request(app.getHttpServer()).get(
        `/v1/users/${targetUser.id.toString()}`,
      )

      expect(response.statusCode).toBe(401)
      expect(response.body).toEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Unauthorized',
      })
    })

    it('[403] Forbidden → should not be able to find user without permission', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/users/${targetUser.id.toString()}`)
        .set('Authorization', `Bearer ${operatorAccessToken.token}`)

      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Acesso negado',
      })
    })

    it("[404] Not Found → should not be able to find user that does'nt exists", async () => {
      const fakeId = randomUUID()
      const response = await request(app.getHttpServer())
        .get(`/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminAccessToken.token}`)

      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({
        statusCode: 404,
        error: 'Not Found',
        message: 'User not found',
      })
    })
  })
})
