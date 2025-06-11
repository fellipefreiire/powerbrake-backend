import { randomUUID } from 'crypto'
import { CacheRepository } from '@/infra/cache/cache-repository'
import { RefreshTokenRepository } from '@/infra/auth/refresh-token.repository'

export class FakeRefreshTokenService implements RefreshTokenRepository {
  constructor(private readonly cache: CacheRepository) {}

  async create(userId: string): Promise<string> {
    const jti = randomUUID()
    await this.cache.set(this.key(jti), userId, 60 * 60 * 24 * 7) // 7 days
    return jti
  }

  async validate(jti: string): Promise<boolean> {
    const userId = await this.cache.get(this.key(jti))
    return !!userId
  }

  async revoke(jti: string): Promise<void> {
    await this.cache.del(this.key(jti))
  }

  async revokeAllForUser(userId: string): Promise<void> {
    const keys = await this.cache.keys('refresh_token:*')

    const deletable: string[] = []
    for (const key of keys) {
      const uid = await this.cache.get(key)
      if (uid === userId) {
        deletable.push(key)
      }
    }

    if (deletable.length > 0) {
      await this.cache.del(deletable)
    }
  }

  private key(jti: string): string {
    return `refresh_token:${jti}`
  }

  // método auxiliar exclusivo para testes
  async isRevoked(jti: string): Promise<boolean> {
    const result = await this.cache.get(this.key(jti))
    return result === null
  }
}
