import { AppModule } from '@/infra/app.module'
import { VersioningType, type INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { UserFactory } from 'test/factories/make-user'
import request from 'supertest'
import type { User } from '@/domain/user/enterprise/entities/user'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'

describe('User status (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory
  let jwt: JwtService
  let adminUser: User
  let managerUser: User
  let supervisorUser: User
  let operatorUser: User
  let user: User

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, UserDatabaseModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    app.enableVersioning({
      type: VersioningType.URI,
    })

    userFactory = moduleRef.get(UserFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()

    adminUser = await userFactory.makePrismaUser({
      name: 'John Doe',
      email: 'johndoe@example.com',
      role: 'ADMIN',
      isActive: true,
    })

    managerUser = await userFactory.makePrismaUser({
      name: 'John Doe',
      email: 'johndoe2@example.com',
      role: 'MANAGER',
      isActive: true,
    })

    supervisorUser = await userFactory.makePrismaUser({
      name: 'John Doe',
      email: 'johndoe3@example.com',
      role: 'SUPERVISOR',
      isActive: true,
    })

    operatorUser = await userFactory.makePrismaUser({
      name: 'John Doe',
      email: 'johndoe4@example.com',
      role: 'OPERATOR',
      isActive: true,
    })

    user = await userFactory.makePrismaUser({
      name: 'John Doe',
      email: 'johndoe5@example.com',
      isActive: true,
    })
  })

  describe('[PATCH] /v1/users/status/:id', async () => {
    it('should be able to activate/deactivate user with role ADMIN', async () => {
      const accessToken = jwt.sign({
        sub: adminUser.id.toString(),
        role: adminUser.role,
      })

      const response = await request(app.getHttpServer())
        .patch(`/v1/users/status/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
    })

    it('should be able to activate/deactivate user with role MANAGER', async () => {
      const accessToken = jwt.sign({
        sub: managerUser.id.toString(),
        role: managerUser.role,
      })

      const response = await request(app.getHttpServer())
        .patch(`/v1/users/status/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
    })
    it('should not be able to activate/deactivate user with role SUPERVISOR', async () => {
      const accessToken = jwt.sign({
        sub: supervisorUser.id.toString(),
        role: supervisorUser.role,
      })

      const response = await request(app.getHttpServer())
        .patch(`/v1/users/status/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(403)
    })
    it('should not be able to activate/deactivate user with role OPERATOR', async () => {
      const accessToken = jwt.sign({
        sub: operatorUser.id.toString(),
        role: operatorUser.role,
      })

      const response = await request(app.getHttpServer())
        .patch(`/v1/users/status/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(403)
    })
  })
})
