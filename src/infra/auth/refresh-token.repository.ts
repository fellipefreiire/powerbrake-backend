import { Injectable } from '@nestjs/common'
import { RedisService } from '@/infra/cache/redis/redis.service'
import { randomUUID } from 'crypto'

@Injectable()
export class RefreshTokenRepository {
  private EXPIRATION_SECONDS = 60 * 60 * 24 * 7 // 7 days

  constructor(private redis: RedisService) {}

  async create(userId: string): Promise<string> {
    const jti = randomUUID()

    await this.redis.set(this.key(jti), userId, 'EX', this.EXPIRATION_SECONDS)

    return jti
  }

  async validate(jti: string): Promise<boolean> {
    const exists = await this.redis.get(this.key(jti))
    return !!exists
  }

  async revoke(jti: string): Promise<void> {
    await this.redis.del(this.key(jti))
  }

  private key(jti: string): string {
    return `refresh_token:${jti}`
  }
}
