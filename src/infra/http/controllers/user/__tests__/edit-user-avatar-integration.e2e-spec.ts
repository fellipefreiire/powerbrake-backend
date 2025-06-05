import request from 'supertest'
import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { UserFactory } from 'test/factories/make-user'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { JwtService } from '@nestjs/jwt'

describe('Edit User Avatar (E2E)', () => {
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

  afterAll(async () => {
    await prisma.$disconnect()
    await app.close()
  })

  it('[INTEGRATION] → should upload an avatar and assign it to the user', async () => {
    const user = await userFactory.makePrismaUser({
      name: 'Test User',
      email: 'test@example.com',
      role: 'OPERATOR',
    })

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      role: user.role,
    })

    const avatarUploadRes = await request(app.getHttpServer())
      .post('/v1/avatar/user')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', './test/e2e/sample-upload.png')

    const avatarId = avatarUploadRes.body.data

    await request(app.getHttpServer())
      .patch(`/v1/users/${user.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Updated User',
        avatarId,
      })
      .expect(200)

    const userOnDatabase = await prisma.user.findUnique({
      where: { id: user.id.toString() },
    })

    const avatarOnDatabase = await prisma.avatar.findUnique({
      where: { id: avatarId },
    })

    expect(userOnDatabase?.avatarId).toBe(avatarId)
    expect(avatarOnDatabase?.userId).toBe(user.id.toString())
  })
})
