import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { CacheRepository } from '../cache/cache-repository'
import { RefreshTokenRepository } from './refresh-token.repository'

@Injectable()
export class RefreshTokenService implements RefreshTokenRepository {
  constructor(private cache: CacheRepository) {}

  async create(userId: string): Promise<string> {
    const jti = randomUUID()

    await this.cache.set(this.key(jti), userId, 60 * 60 * 24 * 7) // 7 days

    return jti
  }

  async validate(jti: string): Promise<boolean> {
    const exists = await this.cache.get(this.key(jti))
    return !!exists
  }

  async revoke(jti: string): Promise<void> {
    await this.cache.del(this.key(jti))
  }

  async revokeAllForUser(userId: string): Promise<void> {
    const keys = await this.cache.keys(`refresh_token:*`)
    const tokens = await Promise.all(
      keys.map(async (key) => {
        const uid = await this.cache.get(key)
        return { key, uid }
      }),
    )
    const keysToDelete = tokens
      .filter((t) => t.uid === userId)
      .map((t) => t.key)

    if (keysToDelete.length > 0) {
      await this.cache.del(keysToDelete)
    }
  }

  private key(jti: string): string {
    return `refresh_token:${jti}`
  }

  async revokeAllForUserExcept(
    userId: string,
    exceptJti: string,
  ): Promise<void> {
    const keys = await this.cache.keys('refresh_token:*')

    const tokens = await Promise.all(
      keys.map(async (key) => {
        const uid = await this.cache.get(key)
        return { key, uid }
      }),
    )

    const keysToDelete = tokens
      .filter((t) => t.uid === userId && t.key !== this.key(exceptJti))
      .map((t) => t.key)

    if (keysToDelete.length > 0) {
      await this.cache.del(keysToDelete)
    }
  }
}
