import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '@/infra/app.module'
import request from 'supertest'
import { UserFactory } from 'test/factories/make-user'
import { AvatarDatabaseModule } from '@/infra/database/prisma/repositories/avatar/avatar-database.module'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { User } from '@/domain/user/enterprise/entities/user'
import { Uploader } from '@/shared/storage/uploader'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { TokenService } from '@/infra/auth/token.service'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'

describe('Upload Avatar (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let token: TokenService
  let adminUser: User
  let adminAccessToken: {
    token: string
    expiresIn: number
  }
  let uploader: Uploader

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AppModule,
        AvatarDatabaseModule,
        UserDatabaseModule,
        CryptographyModule,
      ],
      providers: [UserFactory, TokenService],
    }).compile()

    app = moduleRef.createNestApplication()
    app.enableVersioning({
      type: VersioningType.URI,
    })

    prisma = moduleRef.get(PrismaService)
    userFactory = moduleRef.get(UserFactory)
    token = moduleRef.get(TokenService)
    uploader = moduleRef.get(Uploader)

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

  describe('[POST] /v1/users/avatar', async () => {
    it('[201] Created → should create user avatar', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/avatar')
        .set('Authorization', `Bearer ${adminAccessToken.token}`)
        .attach('file', './test/e2e/sample-upload.png')

      expect(response.statusCode).toBe(201)
      expect(response.body).toEqual({
        data: expect.any(String),
      })
    })

    it('[500] Internal Server Error → should return error if R2 upload fails', async () => {
      vi.spyOn(uploader, 'upload').mockResolvedValueOnce({
        url: '',
      })

      const res = await request(app.getHttpServer())
        .post('/v1/avatar')
        .set('Authorization', `Bearer ${adminAccessToken.token}`)
        .attach('file', './test/e2e/sample-upload.png')
        .expect(500)

      expect(res.body.message).toBe('Failed to upload avatar')

      const avatarInDb = await prisma.avatar.findFirst({
        where: { userId: adminUser.id.toString() },
      })

      expect(avatarInDb).toBeNull()
    })
  })
})
