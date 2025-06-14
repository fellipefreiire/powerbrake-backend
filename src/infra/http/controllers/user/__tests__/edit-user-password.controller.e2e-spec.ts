import request from 'supertest'
import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { UserFactory } from 'test/factories/make-user'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { TokenService } from '@/infra/auth/token.service'
import { CacheRepository } from '@/infra/cache/cache-repository'
import { randomUUID } from 'crypto'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { hash } from 'bcryptjs'

describe('Edit User Password (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let tokenService: TokenService
  let cache: CacheRepository

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, UserDatabaseModule, CryptographyModule],
      providers: [UserFactory, TokenService],
    }).compile()

    app = moduleRef.createNestApplication()
    app.enableVersioning({ type: VersioningType.URI })
    await app.init()

    prisma = moduleRef.get(PrismaService)
    userFactory = moduleRef.get(UserFactory)
    tokenService = moduleRef.get(TokenService)
    cache = moduleRef.get(CacheRepository)
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "users" RESTART IDENTITY CASCADE',
    )

    const keys = await cache.keys('refresh_token:*')
    if (keys.length > 0) await cache.del(keys)
  })

  it('[204] Success → should update password and revoke other sessions', async () => {
    const password = '12345678'
    const user = await userFactory.makePrismaUser({
      passwordHash: await hash(password, 8),
    })

    const jti1 = randomUUID()
    const jti2 = randomUUID()

    const token2 = await tokenService.generate({
      sub: user.id.toString(),
      role: user.role,
      jti: jti2,
    })

    await cache.set(`refresh_token:${jti1}`, user.id.toString())
    await cache.set(`refresh_token:${jti2}`, user.id.toString())

    await request(app.getHttpServer())
      .patch(`/v1/users/${user.id.toString()}/password`)
      .set('Authorization', `Bearer ${token2}`)
      .send({
        currentPassword: password,
        newPassword: 'new-password',
      })
      .expect(204)

    const keys = await cache.keys('refresh_token:*')

    expect(keys).toContain(`refresh_token:${jti2}`)
    expect(keys).not.toContain(`refresh_token:${jti1}`)
  })
})
