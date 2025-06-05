import request from 'supertest'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '@/infra/app.module'
import helmet from 'helmet'

describe('Helmet Middleware (E2E)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    app.use(helmet())
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should apply security headers via Helmet', async () => {
    const response = await request(app.getHttpServer()).get('/health')

    expect(response.statusCode).toBe(200)
    expect(response.headers['x-content-type-options']).toBe('nosniff')
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN')
    expect(response.headers['strict-transport-security']).toContain('max-age=')
    expect(response.headers['content-security-policy']).toContain('default-src')
  })
})
