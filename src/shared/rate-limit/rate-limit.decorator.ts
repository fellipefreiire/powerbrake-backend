import { SetMetadata } from '@nestjs/common'

export interface RateLimitOptions {
  points: number
  duration: number // in seconds
}

export function RateLimit(points: number, duration: number) {
  return SetMetadata('rateLimitOptions', {
    points,
    duration,
  } as RateLimitOptions)
}
