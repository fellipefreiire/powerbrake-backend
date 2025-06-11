import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '@/infra/app.module'
import { UserFactory } from 'test/factories/make-user'
import { AuditLogRepository } from '@/domain/audit-log/application/repositories/audit-log-repository'
import { AuditLogDatabaseModule } from '@/infra/database/prisma/repositories/audit-log/audit-log-database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import request from 'supertest'
import { ActorType } from '@prisma/client'
import { makeAuditLog } from 'test/factories/make-audit-log'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { TokenService } from '@/infra/auth/token.service'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import type { User } from '@/domain/user/enterprise/entities/user'
import { randomUUID } from 'node:crypto'

describe('List Audit Logs (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let token: TokenService
  let auditLogRepository: AuditLogRepository
  let adminUser: User
  let adminAccessToken: {
    token: string
    expiresIn: number
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AppModule,
        AuditLogDatabaseModule,
        UserDatabaseModule,
        CryptographyModule,
      ],
      providers: [UserFactory, TokenService],
    }).compile()

    app = moduleRef.createNestApplication()
    app.enableVersioning({ type: VersioningType.URI })

    prisma = moduleRef.get(PrismaService)
    token = moduleRef.get(TokenService)
    userFactory = moduleRef.get(UserFactory)
    auditLogRepository = moduleRef.get(AuditLogRepository)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "users" CASCADE')

    adminUser = await userFactory.makePrismaUser({
      email: 'johndoe@example.com',
      role: 'ADMIN',
    })

    adminAccessToken = await token.generateAccessToken({
      sub: adminUser.id.toString(),
      role: adminUser.role,
      jti: randomUUID(),
    })
  })

  afterEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "users" CASCADE')
  })
  it('[200] OK → should list audit logs with correct actor info', async () => {
    const log = makeAuditLog({
      actorId: adminUser.id.toString(),
      actorType: ActorType.USER,
    })
    await auditLogRepository.create(log)

    const response = await request(app.getHttpServer())
      .get('/v1/audit-logs')
      .set('Authorization', `Bearer ${adminAccessToken.token}`)
      .query({
        actorType: 'USER',
        actorEmail: adminUser.email,
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].actor.name).toBe(adminUser.name)
    expect(response.body.data[0].actor.email).toBe(adminUser.email)
  })

  it('[400] Bad Request → should return 400 if actorType is missing', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/audit-logs')
      .set('Authorization', `Bearer ${adminAccessToken.token}`)

    expect(response.statusCode).toBe(400)
  })

  it('[401] Unauthorized → should return 401 if no token is provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/audit-logs')
      .query({
        actorType: 'USER',
      })

    expect(response.statusCode).toBe(401)
  })

  it('[403] Forbidden → should return 403 if user does not have permission', async () => {
    const normalUser = await userFactory.makePrismaUser({
      email: 'user@empresa.com',
      role: 'OPERATOR',
    })

    const accessToken = await token.generateAccessToken({
      sub: normalUser.id.toString(),
      role: normalUser.role,
      jti: randomUUID(),
    })

    const response = await request(app.getHttpServer())
      .get('/v1/audit-logs')
      .set('Authorization', `Bearer ${accessToken.token}`)
      .query({
        actorType: 'USER',
      })

    expect(response.statusCode).toBe(403)
  })

  it('[422] Unprocessable Entity → should return 422 if invalid date format is provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/audit-logs')
      .set('Authorization', `Bearer ${adminAccessToken.token}`)
      .query({
        actorType: 'USER',
        startDate: 'invalid-date',
      })

    expect(response.statusCode).toBe(422)
  })
})
