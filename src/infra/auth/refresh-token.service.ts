import { Injectable } from '@nestjs/common'
import { RedisService } from '@/infra/cache/redis/redis.service'
import { randomUUID } from 'crypto'

@Injectable()
export class RefreshTokenService {
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

  async revokeAllForUser(userId: string): Promise<void> {
    const keys = await this.redis.keys(`refresh_token:*`)
    const tokens = await Promise.all(
      keys.map(async (key) => {
        const uid = await this.redis.get(key)
        return { key, uid }
      }),
    )
    const keysToDelete = tokens
      .filter((t) => t.uid === userId)
      .map((t) => t.key)

    if (keysToDelete.length) {
      await this.redis.del(...keysToDelete)
    }
  }

  private key(jti: string): string {
    return `refresh_token:${jti}`
  }
}
