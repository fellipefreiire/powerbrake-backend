import type { CacheRepository } from '@/infra/cache/cache-repository'

export class FakeCacheService implements CacheRepository {
  private store = new Map<string, { value: string; expiresAt?: number }>()

  async set(key: string, value: string, ttlInSeconds?: number): Promise<void> {
    const expiresAt = ttlInSeconds
      ? Date.now() + ttlInSeconds * 1000
      : undefined
    this.store.set(key, { value, expiresAt })
  }

  async get(key: string): Promise<string | null> {
    const record = this.store.get(key)
    if (!record) return null

    if (record.expiresAt && Date.now() > record.expiresAt) {
      this.store.delete(key)
      return null
    }

    return record.value
  }

  async del(key: string | string[]): Promise<number> {
    const keys = Array.isArray(key) ? key : [key]
    let count = 0

    for (const k of keys) {
      if (this.store.delete(k)) count++
    }

    return count
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(
      '^' +
        pattern
          .replace(/\*/g, '.*')
          .replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&') +
        '$',
    )
    return Array.from(this.store.keys()).filter((key) => regex.test(key))
  }
}
