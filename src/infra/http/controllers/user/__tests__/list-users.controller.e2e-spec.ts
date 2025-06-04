import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '@/infra/app.module'
import request from 'supertest'
import { UserFactory } from 'test/factories/make-user'
import { JwtService } from '@nestjs/jwt'
import { UserDatabaseModule } from '@/infra/database/repositories/user/user-database.module'

describe('List users (E2E)', () => {
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

  test('[GET] /v1/users', async () => {
    const user = await userFactory.makePrismaUser({})

    const accessToken = jwt.sign({ sub: user.id.toString(), role: user.role })

    const response = await request(app.getHttpServer())
      .get('/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        page: 1,
      })

    expect(response.statusCode).toBe(200)
    expect(response.body?.data).toHaveLength(1)
  })
})
