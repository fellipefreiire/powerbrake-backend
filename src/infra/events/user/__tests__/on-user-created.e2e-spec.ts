import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { UserFactory } from 'test/factories/make-user'
import { TokenService } from '@/infra/auth/token.service'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { randomUUID } from 'node:crypto'
import { DomainEvents } from '@/core/events/domain-events'
import { waitFor } from 'test/utils/wait-for'

describe('User Created Event (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let tokenService: TokenService
  let userFactory: UserFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, UserDatabaseModule],
      providers: [UserFactory, TokenService],
    }).compile()

    app = moduleRef.createNestApplication()
    app.enableVersioning({ type: VersioningType.URI })

    prisma = moduleRef.get(PrismaService)
    tokenService = moduleRef.get(TokenService)
    userFactory = moduleRef.get(UserFactory)

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

  it('should create an audit log when user is created', async () => {
    const admin = await userFactory.makePrismaUser({ role: 'ADMIN' })

    const accessToken = await tokenService.generateAccessToken({
      sub: admin.id.toString(),
      role: admin.role,
      jti: randomUUID(),
    })

    const response = await request(app.getHttpServer())
      .post('/v1/users')
      .set('Authorization', `Bearer ${accessToken.token}`)
      .send({
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: '12345678',
        role: 'MANAGER',
        addresses: [
          {
            street: 'Rua Um',
            number: '123',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '00000-000',
          },
        ],
      })

    expect(response.statusCode).toBe(201)

    console.log({
      response: response.body,
    })

    await waitFor(async () => {
      const teste = await prisma.auditLog.findMany()
      console.log({ teste })
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          actorId: admin.id.toString(),
          action: 'user:created',
        },
      })

      expect(auditLog).not.toBeNull()
      expect(auditLog).toMatchObject({
        actorId: admin.id.toString(),
        actorType: 'USER',
        action: 'user:created',
        entity: 'USER',
      })
    })
  })
})
