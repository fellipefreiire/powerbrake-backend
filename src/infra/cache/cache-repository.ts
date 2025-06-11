export abstract class CacheRepository {
  abstract set(key: string, value: string, ttlInSeconds?: number): Promise<void>
  abstract get(key: string): Promise<string | null>
  abstract del(key: string | string[]): Promise<number>
  abstract keys(pattern: string): Promise<string[]>
}
