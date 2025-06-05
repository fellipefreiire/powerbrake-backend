import { RedisService } from '@/infra/cache/redis/redis.service'
import { Injectable } from '@nestjs/common'
import { HealthIndicatorResult } from '@nestjs/terminus'

@Injectable()
export class RedisHealthIndicator {
  constructor(private readonly redisService: RedisService) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.redisService.ping()
      return {
        [key]: { status: 'up' },
      }
    } catch {
      return {
        [key]: { status: 'down' },
      }
    }
  }
}
