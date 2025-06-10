import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '@/infra/app.module'
import request from 'supertest'
import { UserFactory } from 'test/factories/make-user'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import type { User } from '@/domain/user/enterprise/entities/user'
import { TokenService } from '@/infra/auth/token.service'

const createUserEndpoint = '/v1/users'

describe('Create User (E2E)', () => {
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

    operatorUser = await userFactory.makePrismaUser({
      email: 'operator.user@example.com',
      role: 'OPERATOR',
    })

    operatorAccessToken = await token.generateAccessToken({
      sub: operatorUser.id.toString(),
      role: operatorUser.role,
    })
  })

  afterEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "users" RESTART IDENTITY CASCADE',
    )
  })

  describe(`[POST] ${createUserEndpoint}`, async () => {
    it('[201] Created → should be able to create a new user', async () => {
      const payload = {
        name: 'New User',
        role: 'OPERATOR',
        password: '123456',
        email: 'new.user@example.com',
        addresses: [
          {
            street: 'New Street',
            number: '202',
            neighborhood: 'New Neighborhood',
            city: 'New City',
            state: 'New State',
            zipCode: '11111-111',
          },
        ],
      }

      const response = await request(app.getHttpServer())
        .post(createUserEndpoint)
        .set('Authorization', `Bearer ${adminAccessToken.token}`)
        .send(payload)

      expect(response.statusCode).toBe(201)

      const userOnDatabase = await prisma.user.findFirst({
        where: {
          email: payload.email,
        },
      })

      expect(userOnDatabase).toBeTruthy()
    })

    it('[400] Bad Request → should not be able to create user without required params', async () => {
      const payload = {
        email: 'missing.name@example.com',
        password: 'SomePass1!',
        role: 'OPERATOR',
      }

      const response = await request(app.getHttpServer())
        .post(createUserEndpoint)
        .set('Authorization', `Bearer ${adminAccessToken.token}`)
        .send(payload)

      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Missing required fields',
        }),
      )
    })

    it('[401] Unauthorized → should not be able to create user without token', async () => {
      const payload = {
        name: 'User NoAuth',
        email: 'noauth.user@example.com',
        password: 'NoAuthPass1!',
        role: 'OPERATOR',
      }

      const response = await request(app.getHttpServer())
        .post(createUserEndpoint)
        .send(payload)

      expect(response.statusCode).toBe(401)
      expect(response.body).toEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Unauthorized',
      })
    })

    it('[403] Forbidden → should not be able to create user without permission', async () => {
      const payload = {
        name: 'Attempted User',
        email: 'attempted@example.com',
        password: 'AttemptedPass1!',
        role: 'OPERATOR',
      }

      const response = await request(app.getHttpServer())
        .post(createUserEndpoint)
        .set('Authorization', `Bearer ${operatorAccessToken.token}`)
        .send(payload)

      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Acesso negado',
      })
    })

    it('[409] Conflict → should not be able to create user with same email', async () => {
      await userFactory.makePrismaUser({
        email: 'new.user@example.com',
        role: 'OPERATOR',
      })

      const payload = {
        name: 'New User',
        role: 'OPERATOR',
        password: '123456',
        email: 'new.user@example.com',
        addresses: [
          {
            street: 'New Street',
            number: '202',
            neighborhood: 'New Neighborhood',
            city: 'New City',
            state: 'New State',
            zipCode: '11111-111',
          },
        ],
      }

      const response = await request(app.getHttpServer())
        .post(createUserEndpoint)
        .set('Authorization', `Bearer ${adminAccessToken.token}`)
        .send(payload)

      expect(response.statusCode).toBe(409)
      expect(response.body).toEqual({
        statusCode: 409,
        error: 'Conflict',
        message: `User ${payload.email} already exists`,
      })
    })

    it('[422] Unprocessable Entity → should not be able to create user with invalid params', async () => {
      const payload = {
        name: 'Invalid Email',
        email: 'invalid-email',
        password: 'SomePass1!',
        role: 'UNKNOWN_ROLE',
        addresses: [],
      }

      const response = await request(app.getHttpServer())
        .post(createUserEndpoint)
        .set('Authorization', `Bearer ${adminAccessToken.token}`)
        .send(payload)

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
