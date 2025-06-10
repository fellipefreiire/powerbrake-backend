import { z } from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  APP_PORT: z.coerce.number().optional().default(3333),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  NODE_ENV: z.string(),
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.string(),
  DATABASE_USERNAME: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string(),
  REDIS_HOST: z.string().optional().default('127.0.0.1'),
  REDIS_PORT: z.coerce.number().optional().default(6379),
  REDIS_DB: z.coerce.number().optional().default(0),
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_BUCKET_NAME: z.string(),
  RESEND_API_KEY: z.string(),
  RESET_PASSWORD_URL: z.string(),
})

export type Env = z.infer<typeof envSchema>
