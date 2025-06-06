import { AppModule } from '@/infra/app.module'
import { VersioningType, type INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { UserFactory } from 'test/factories/make-user'
import request from 'supertest'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import type { User } from '@/domain/user/enterprise/entities/user'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { TokenService } from '@/infra/auth/token.service'

describe('Edit User (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let token: TokenService
  let adminUser: User
  let adminAccessToken: {
    token: string
    expiresIn: number
  }

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
  })

  afterEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "users" RESTART IDENTITY CASCADE',
    )
  })

  describe('[PATCH] /v1/users/:id', async () => {
    it('[200] Success → should be able to edit user data', async () => {
      const payload = {
        name: 'Updated Name',
      }

      const response = await request(app.getHttpServer())
        .patch(`/v1/users/${adminUser.id.toString()}`)
        .set('Authorization', `Bearer ${adminAccessToken.token}`)
        .send(payload)

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({
        data: expect.objectContaining({
          id: adminUser.id.toString(),
          name: payload.name,
        }),
      })

      const userOnDatabase = await prisma.user.findUnique({
        where: { id: adminUser.id.toString() },
      })
      expect(userOnDatabase?.name).toBe(payload.name)
    })

    it('[400] Bad Request → should not be able to edit user without required params', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/v1/users/${adminUser.id.toString()}`)
        .set('Authorization', `Bearer ${adminAccessToken.token}`)
        .send({})

      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Missing required fields',
        }),
      )
    })

    it('[401] Unauthorized → should not be able to edit user without token', async () => {
      const payload = { name: 'Attempt NoAuth' }

      const response = await request(app.getHttpServer())
        .patch(`/v1/users/${adminUser.id.toString()}`)
        .send(payload)

      expect(response.statusCode).toBe(401)
      expect(response.body).toEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Unauthorized',
      })
    })

    it('[403] Forbidden → should not be able to edit another user data', async () => {
      const operatorUser = await userFactory.makePrismaUser({
        email: 'operator.user@example.com',
        role: 'OPERATOR',
      })
      const payload = { name: 'Attempted Edit' }

      const response = await request(app.getHttpServer())
        .patch(`/v1/users/${operatorUser.id.toString()}`)
        .set('Authorization', `Bearer ${adminAccessToken.token}`)
        .send(payload)

      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Acesso negado',
      })
    })

    it('[422] Unprocessable Entity → should not be able to edit user with invalid params', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/v1/users/${adminUser.id.toString()}`)
        .set('Authorization', `Bearer ${adminAccessToken.token}`)
        .send({ name: '' })

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
