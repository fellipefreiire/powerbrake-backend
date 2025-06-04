import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '@/infra/app.module'
import request from 'supertest'
import { UserFactory } from 'test/factories/make-user'
import { JwtService } from '@nestjs/jwt'
import { UserDatabaseModule } from '@/infra/database/repositories/user/user-database.module'

describe('Create user (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
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

    prisma = moduleRef.get(PrismaService)
    userFactory = moduleRef.get(UserFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  describe('[POST] /v1/users', async () => {
    it('should be able to create a new user for role ADMIN', async () => {
      const user = await userFactory.makePrismaUser({
        email: 'johndoe@example.com',
        role: 'ADMIN',
      })

      const accessToken = jwt.sign({ sub: user.id.toString(), role: user.role })

      const response = await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Created John Doe',
          role: 'OPERATOR',
          password: '123456',
          email: 'createdjohndoe@example.com',
        })

      expect(response.statusCode).toBe(201)

      const userOnDatabase = await prisma.user.findFirst({
        where: {
          email: 'createdjohndoe@example.com',
        },
      })

      expect(userOnDatabase).toBeTruthy()
    })

    it('should be able to create a new user for role MANAGER', async () => {
      const user = await userFactory.makePrismaUser({
        email: 'johndoe2@example.com',
        role: 'MANAGER',
      })

      const accessToken = jwt.sign({ sub: user.id.toString(), role: user.role })

      const response = await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Created John Doe 2',
          role: 'OPERATOR',
          password: '123456',
          email: 'createdjohndoe2@example.com',
        })

      expect(response.statusCode).toBe(201)

      const userOnDatabase = await prisma.user.findFirst({
        where: {
          email: 'createdjohndoe2@example.com',
        },
      })

      expect(userOnDatabase).toBeTruthy()
    })

    it('should block user creation for role SUPERVISOR', async () => {
      const user = await userFactory.makePrismaUser({
        email: 'johndoe3@example.com',
        role: 'SUPERVISOR',
      })

      const accessToken = jwt.sign({ sub: user.id.toString(), role: user.role })

      const response = await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Created John Doe 3',
          role: 'OPERATOR',
          password: '123456',
          email: 'createdjohndoe3@gmail.com',
        })

      expect(response.statusCode).toBe(403)
    })

    it('should block user creation for role OPERATOR', async () => {
      const user = await userFactory.makePrismaUser({
        email: 'johndoe4@example.com',
        role: 'OPERATOR',
      })

      const accessToken = jwt.sign({ sub: user.id.toString(), role: user.role })

      const response = await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Created John Doe 4',
          role: 'OPERATOR',
          password: '123456',
          email: 'createdjohndoe4@gmail.com',
        })

      expect(response.statusCode).toBe(403)
    })
  })
})
