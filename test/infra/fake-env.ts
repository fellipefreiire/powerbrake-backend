import type { Env } from '@/infra/env/env'
import { EnvService } from '@/infra/env/env.service'
import type { ConfigService } from '@nestjs/config'

const fakeValues: Env = {
  NODE_ENV: 'test',
  APP_PORT: 3333,
  DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: '5432',
  DATABASE_USERNAME: 'user',
  DATABASE_PASSWORD: 'pass',
  DATABASE_NAME: 'app_db',
  REDIS_HOST: '127.0.0.1',
  REDIS_PORT: 6379,
  REDIS_DB: 0,
  REDIS_COMMAND_TIMEOUT: 1000,
  RATE_LIMIT_POINTS: 10,
  RATE_LIMIT_DURATION: 60,
  CLOUDFLARE_ACCOUNT_ID: 'fake-cloudflare-id',
  AWS_ACCESS_KEY_ID: 'fake-aws-key',
  AWS_SECRET_ACCESS_KEY: 'fake-aws-secret',
  AWS_BUCKET_NAME: 'fake-bucket',
  STORAGE_RETRY_ATTEMPTS: 3,
  STORAGE_RETRY_BACKOFF: 100,
  STORAGE_TIMEOUT: 2000,
  RESEND_API_KEY: 'fake-resend-api-key',
  RESET_PASSWORD_URL: 'https://example.com/reset',
  EMAIL_RETRY_ATTEMPTS: 3,
  EMAIL_RETRY_BACKOFF: 100,
  EMAIL_SEND_TIMEOUT: 3000,
  JWT_PRIVATE_KEY: 'private-key',
  JWT_PUBLIC_KEY: 'public-key',
}

const fakeConfigService = {
  get: <T extends keyof Env>(key: T) => fakeValues[key],
} as ConfigService<Env, true>

export const makeFakeEnvService = () => {
  return new EnvService(fakeConfigService)
}
