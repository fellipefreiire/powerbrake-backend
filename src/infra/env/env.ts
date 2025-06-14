import { z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z.string(),
  APP_PORT: z.coerce.number().optional().default(3333),

  DATABASE_URL: z.string().url(),
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.string(),
  DATABASE_USERNAME: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string(),

  REDIS_HOST: z.string().optional().default('127.0.0.1'),
  REDIS_PORT: z.coerce.number().optional().default(6379),
  REDIS_DB: z.coerce.number().optional().default(0),
  REDIS_COMMAND_TIMEOUT: z.coerce.number(),

  RATE_LIMIT_POINTS: z.coerce.number(),
  RATE_LIMIT_DURATION: z.coerce.number(),

  CLOUDFLARE_ACCOUNT_ID: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_BUCKET_NAME: z.string(),
  STORAGE_RETRY_ATTEMPTS: z.coerce.number(),
  STORAGE_RETRY_BACKOFF: z.coerce.number(),
  STORAGE_TIMEOUT: z.coerce.number(),

  RESEND_API_KEY: z.string(),
  RESET_PASSWORD_URL: z.string(),
  EMAIL_RETRY_ATTEMPTS: z.coerce.number(),
  EMAIL_RETRY_BACKOFF: z.coerce.number(),
  EMAIL_SEND_TIMEOUT: z.coerce.number(),

  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
})

export type Env = z.infer<typeof envSchema>
