import { AppModule } from '@/infra/app.module'
import { VersioningType, type INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { UserFactory } from 'test/factories/make-user'
import request from 'supertest'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'

describe('Edit user (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory
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

    userFactory = moduleRef.get(UserFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  describe('[PATCH] /v1/users/:id', async () => {
    it('should be able to edit user data', async () => {
      const user = await userFactory.makePrismaUser({
        name: 'John Doe',
        email: 'johndoe@example.com',
        role: 'ADMIN',
      })

      const accessToken = jwt.sign({ sub: user.id.toString(), role: user.role })

      const response = await request(app.getHttpServer())
        .patch(`/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'John Doe 2',
        })

      expect(response.statusCode).toBe(200)
    })

    it.skip('should not be able to edit another user data', async () => {
      const user = await userFactory.makePrismaUser({
        name: 'John Doe 2',
        email: 'johndoe2@example.com',
        role: 'ADMIN',
      })

      const user2 = await userFactory.makePrismaUser({
        name: 'John Doe 3',
        email: 'johndoe3@example.com',
      })

      const accessToken = jwt.sign({ sub: user.id.toString(), role: user.role })

      const response = await request(app.getHttpServer())
        .patch(`/v1/users/${user2.id.toString()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'John Doe 3',
        })

      expect(response.statusCode).toBe(403)
    })
  })
})
