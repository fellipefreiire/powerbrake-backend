import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '@/infra/app.module'
import request from 'supertest'
import { UserFactory } from 'test/factories/make-user'
import { JwtService } from '@nestjs/jwt'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import type { User } from '@/domain/user/enterprise/entities/user'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('List Users (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let jwt: JwtService
  let adminUser: User
  let adminAccessToken: string
  let operatorUser: User
  let operatorAccessToken: string
  const ITEMS_PER_PAGE = 20

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

    adminAccessToken = jwt.sign({
      sub: adminUser.id.toString(),
      role: adminUser.role,
    })

    operatorUser = await userFactory.makePrismaUser({
      email: 'operator.user@example.com',
      role: 'OPERATOR',
    })

    operatorAccessToken = jwt.sign({
      sub: operatorUser.id.toString(),
      role: operatorUser.role,
    })

    const usersToCreate = Array.from({ length: ITEMS_PER_PAGE }, (_, i) => ({
      name: `User${i + 1}`,
      email: `user${i + 1}@example.com`,
    }))

    await userFactory.makeManyPrismaUser(usersToCreate)
  })

  afterEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "users" RESTART IDENTITY CASCADE',
    )
  })

  describe('[GET] /v1/users', async () => {
    it('[200] Success → should be able to list users', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: 1 })

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({
        data: expect.arrayContaining(
          Array.from({ length: ITEMS_PER_PAGE }, () =>
            expect.objectContaining({
              id: expect.any(String),
              email: expect.any(String),
            }),
          ),
        ),
      })
      expect(response.body?.data).toHaveLength(ITEMS_PER_PAGE)
    })

    it('[200] Success should be able to list paginated users', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: 2 })

      expect(response.statusCode).toBe(200)
      expect(response.body.data).toHaveLength(2)
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
        .set('Authorization', `Bearer ${operatorAccessToken}`)
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
        .set('Authorization', `Bearer ${adminAccessToken}`)
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
