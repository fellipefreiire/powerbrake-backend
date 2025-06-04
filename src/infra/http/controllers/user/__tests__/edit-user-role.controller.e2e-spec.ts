import { AppModule } from '@/infra/app.module'
import { VersioningType, type INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { UserFactory } from 'test/factories/make-user'
import request from 'supertest'
import type { User } from '@/domain/user/enterprise/entities/user'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Role } from '@prisma/client'
import { randomUUID } from 'node:crypto'

describe('Edit User Role (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let jwt: JwtService
  let adminUser: User
  let adminAccessToken: string
  let operatorUser: User
  let operatorAccessToken: string
  let supervisorUser: User
  let supervisorAccessToken: string
  let targetUser: User

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

    supervisorUser = await userFactory.makePrismaUser({
      email: 'supervisor.user@example.com',
      role: 'SUPERVISOR',
    })

    supervisorAccessToken = jwt.sign({
      sub: supervisorUser.id.toString(),
      role: supervisorUser.role,
    })

    targetUser = await userFactory.makePrismaUser({
      email: 'target.user@example.com',
      role: 'OPERATOR',
    })
  })

  afterEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "users" RESTART IDENTITY CASCADE',
    )
  })

  describe('[PATCH] /v1/users/:id/role', async () => {
    it('[200] Success → should be able to edit user role', async () => {
      const payload = {
        role: Role.MANAGER,
      }

      const response = await request(app.getHttpServer())
        .patch(`/v1/users/${targetUser.id.toString()}/role`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(payload)

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({
        data: expect.objectContaining({
          id: targetUser.id.toString(),
          role: Role.MANAGER,
        }),
      })

      const userOnDatabase = await prisma.user.findUnique({
        where: {
          id: targetUser.id.toString(),
        },
      })

      expect(userOnDatabase?.role).toBe(Role.MANAGER)
    })

    it('[400] Bad Request → should not be able to edit user role without the right id', async () => {
      const payload = { role: Role.MANAGER }

      const response = await request(app.getHttpServer())
        .patch('/v1/users/invalid-uuid/role')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(payload)

      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Param id must be a valid UUID',
      })
    })

    it('[401] Unauthorized → should not be able to edit user role without token', async () => {
      const payload = { role: Role.MANAGER }

      const response = await request(app.getHttpServer())
        .patch(`/v1/users/${targetUser.id.toString()}/role`)
        .send(payload)

      expect(response.statusCode).toBe(401)
      expect(response.body).toEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Unauthorized',
      })
    })

    it('[403] Forbidden → should not be able to edit user role without permission (OPERATOR)', async () => {
      const payload = { role: Role.MANAGER }

      const response = await request(app.getHttpServer())
        .patch(`/v1/users/${targetUser.id.toString()}/role`)
        .set('Authorization', `Bearer ${operatorAccessToken}`)
        .send(payload)

      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Acesso negado',
      })
    })

    it('[403] Forbidden → should not be able to edit user role without permission (SUPERVISOR)', async () => {
      const payload = { role: Role.ADMIN }

      const response = await request(app.getHttpServer())
        .patch(`/v1/users/${targetUser.id.toString()}/role`)
        .set('Authorization', `Bearer ${supervisorAccessToken}`)
        .send(payload)

      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Acesso negado',
      })
    })

    it('[404] Not Found → should not be able to edit not found user', async () => {
      const fakeId = randomUUID()
      const payload = { role: Role.MANAGER }

      const response = await request(app.getHttpServer())
        .patch(`/v1/users/${fakeId}/role`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(payload)

      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({
        statusCode: 404,
        error: 'Not Found',
        message: 'User not found',
      })
    })

    it('[422] Unprocessable Entity → should not be able to edit user with invalid role', async () => {
      const payload = { role: 'UNKNOWN_ROLE' }

      const response = await request(app.getHttpServer())
        .patch(`/v1/users/${targetUser.id.toString()}/role`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
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
