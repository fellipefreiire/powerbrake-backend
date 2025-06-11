import request from 'supertest'
import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { UserFactory } from 'test/factories/make-user'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { TokenService } from '@/infra/auth/token.service'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { randomUUID } from 'node:crypto'

describe('Edit User Avatar (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let token: TokenService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, UserDatabaseModule, CryptographyModule],
      providers: [UserFactory, TokenService],
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
    await prisma.$disconnect()
    await app.close()
  })

  it('[INTEGRATION] → should upload an avatar and assign it to the user', async () => {
    const user = await userFactory.makePrismaUser({
      name: 'Test User',
      email: 'test@example.com',
      role: 'OPERATOR',
    })

    const accessToken = await token.generateAccessToken({
      sub: user.id.toString(),
      role: user.role,
      jti: randomUUID(),
    })

    const avatarUploadRes = await request(app.getHttpServer())
      .post('/v1/avatar')
      .set('Authorization', `Bearer ${accessToken.token}`)
      .attach('file', './test/e2e/sample-upload.png')

    const avatarId = avatarUploadRes.body.data

    const payload = {
      name: 'Updated User',
      avatarId,
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

    await request(app.getHttpServer())
      .patch(`/v1/users/${user.id}`)
      .set('Authorization', `Bearer ${accessToken.token}`)
      .send(payload)
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
