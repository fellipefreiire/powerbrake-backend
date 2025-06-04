import { UserFactory } from 'test/factories/make-user'
import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '@/infra/app.module'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'

describe('Authenticate (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory

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

    await app.init()
  })

  test.only('[POST] /v1/users/login', async () => {
    await userFactory.makePrismaUser({
      email: 'johndoe@example.com',
      passwordHash: await hash('123456', 8),
    })

    const response = await request(app.getHttpServer())
      .post('/v1/users/login')
      .send({
        email: 'johndoe@example.com',
        password: '123456',
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      access_token: expect.any(String),
      expiresIn: expect.any(Number),
    })
  })
})
