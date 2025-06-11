import { Injectable } from '@nestjs/common'
import { CacheRepository } from '../cache-repository'
import { RedisService } from './redis.service'

@Injectable()
export class RedisCacheRepository implements CacheRepository {
  private EXPIRATION_SECONDS = 60 * 10 // 10 minutes
  constructor(private redis: RedisService) {}

  async set(key: string, value: string, ttlInSeconds?: number): Promise<void> {
    await this.redis.set(
      key,
      value,
      'EX',
      ttlInSeconds || this.EXPIRATION_SECONDS,
    )
  }

  get(key: string): Promise<string | null> {
    return this.redis.get(key)
  }

  async del(key: string): Promise<number> {
    return await this.redis.del(key)
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.redis.keys(pattern)
  }
}
