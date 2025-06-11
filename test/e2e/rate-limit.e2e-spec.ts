import { INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'

describe('Rate Limit (E2E)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    app.enableVersioning({ type: VersioningType.URI })
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 429 after too many requests', async () => {
    const server = app.getHttpServer()

    let lastResponse

    for (let i = 0; i < 11; i++) {
      lastResponse = await request(server)
        .get('/health')
        .set('X-Forwarded-For', '127.0.0.1')
    }

    expect(lastResponse.statusCode).toBe(429)
  }, 10000)
})
