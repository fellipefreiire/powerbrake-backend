import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '@/infra/app.module'
import request from 'supertest'
import { UserFactory } from 'test/factories/make-user'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import type { User } from '@/domain/user/enterprise/entities/user'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { TokenService } from '@/infra/auth/token.service'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { randomUUID } from 'node:crypto'

describe('List Users (E2E)', () => {
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
  const ITEMS_PER_PAGE = 10

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
      jti: randomUUID(),
    })

    operatorUser = await userFactory.makePrismaUser({
      email: 'operator.user@example.com',
      role: 'OPERATOR',
    })

    operatorAccessToken = await token.generateAccessToken({
      sub: operatorUser.id.toString(),
      role: operatorUser.role,
      jti: randomUUID(),
    })

    const usersToCreate = Array.from(
      { length: ITEMS_PER_PAGE + 15 },
      (_, i) => ({
        name: `User${i + 1}`,
        email: `user${i + 1}@example.com`,
      }),
    )

    await userFactory.makeManyPrismaUser(usersToCreate)
  })

  afterEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "users" RESTART IDENTITY CASCADE',
    )
  })

  describe('[GET] /v1/users', async () => {
    it('[200] Success → should be able to list users with meta', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken.token}`)

      expect(response.statusCode).toBe(200)
      expect(response.body.data).toHaveLength(20)
      expect(response.body.meta).toEqual({
        total: 27,
        count: 20,
        perPage: 20,
        totalPages: 2,
        currentPage: 1,
        nextPage: 2,
        previousPage: null,
      })
    })

    it('[200] Success should be able to list paginated users', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken.token}`)
        .query({ page: 2 })

      expect(response.statusCode).toBe(200)
      expect(response.body.data).toHaveLength(7)
      response.body.data.forEach((user: User) => {
        expect(user).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            email: expect.any(String),
          }),
        )
      })
    })

    it('[401] Unauthorized → should not be able to list users without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/users')
        .query({ page: 1 })

      expect(response.statusCode).toBe(401)
      expect(response.body).toEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: expect.stringContaining('Unauthorized'),
      })
    })

    it('[403] Forbidden → should not be able to list users without permission', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/users')
        .set('Authorization', `Bearer ${operatorAccessToken.token}`)
        .query({ page: 1 })

      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Acesso negado',
      })
    })

    it('[422] Unprocessable Entity → should not be able to list users with invalid query', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken.token}`)
        .query({ page: 'abc' })

      expect(response.statusCode).toBe(422)
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 422,
          error: 'Unprocessable Entity',
          message: 'Validation failed',
        }),
      )
    })
  })
})
