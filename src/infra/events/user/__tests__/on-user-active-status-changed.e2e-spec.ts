import { DomainEvents } from '@/core/events/domain-events'
import { AppModule } from '@/infra/app.module'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { TokenService } from '@/infra/auth/token.service'
import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { UserFactory } from 'test/factories/make-user'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { waitFor } from 'test/utils/wait-for'

describe('On user active status changed (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let tokenService: TokenService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, UserDatabaseModule, CryptographyModule],
      providers: [UserFactory, TokenService],
    }).compile()

    app = moduleRef.createNestApplication()
    app.enableVersioning({ type: VersioningType.URI })

    prisma = moduleRef.get(PrismaService)
    userFactory = moduleRef.get(UserFactory)
    tokenService = moduleRef.get(TokenService)

    DomainEvents.shouldRun = true

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "users" CASCADE')
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "audit_logs" CASCADE')
  })

  it('[EVENT] → should create audit log when user active status is updated', async () => {
    const admin = await userFactory.makePrismaUser({ role: 'ADMIN' })
    const targetUser = await userFactory.makePrismaUser({ isActive: true })

    const accessToken = await tokenService.generateAccessToken({
      sub: admin.id.toString(),
      role: admin.role,
      jti: randomUUID(),
    })

    const response = await request(app.getHttpServer())
      .patch(`/v1/users/${targetUser.id.toString()}/status`)
      .set('Authorization', `Bearer ${accessToken.token}`)
      .send({ isActive: false })

    expect(response.statusCode).toBe(200)

    await waitFor(async () => {
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          actorId: admin.id.toString(),
          action: 'user:active_status_updated',
        },
      })

      expect(auditLog).not.toBeNull()
      expect(auditLog).toMatchObject({
        actorId: admin.id.toString(),
        actorType: 'USER',
        entity: 'USER',
        entityId: targetUser.id.toString(),
        action: 'user:active_status_updated',
      })

      expect(
        typeof auditLog!.changes === 'string'
          ? JSON.parse(auditLog!.changes)
          : auditLog!.changes,
      ).toEqual({
        isActive: {
          before: true,
          after: false,
        },
      })
    })
  })
})
