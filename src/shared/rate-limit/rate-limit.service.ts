import { Injectable, Logger } from '@nestjs/common'
import { EnvService } from '@/infra/env/env.service'
import {
  RateLimiterRedis,
  RateLimiterMemory,
  RateLimiterAbstract,
  RateLimiterRes,
} from 'rate-limiter-flexible'
import { RedisService } from '@/infra/cache/redis/redis.service'

type ConsumeResult =
  | { allowed: true; retryAfter?: undefined; source: 'redis' | 'memory' }
  | { allowed: false; retryAfter: number; source: 'redis' | 'memory' }

@Injectable()
export class RateLimitService {
  private limiter: RateLimiterAbstract
  private logger = new Logger(RateLimitService.name)
  private customLimiters = new Map<string, RateLimiterAbstract>()
  private readonly defaultPoints: number
  private readonly defaultDuration: number

  constructor(
    private readonly envService: EnvService,
    private readonly redisService: RedisService,
  ) {
    this.defaultPoints = Number(this.envService.get('RATE_LIMIT_POINTS')) || 100
    this.defaultDuration =
      Number(this.envService.get('RATE_LIMIT_DURATION')) || 60

    if (this.redisService && this.redisService.status === 'ready') {
      this.logger.log('Usando rate limit com Redis')
      this.limiter = new RateLimiterRedis({
        storeClient: this.redisService,
        keyPrefix: 'rate-limit',
        points: this.defaultPoints,
        duration: this.defaultDuration,
        insuranceLimiter: new RateLimiterMemory({
          points: this.defaultPoints,
          duration: this.defaultDuration,
          keyPrefix: 'rate-limit',
        }),
      })
    } else {
      this.logger.warn(
        'Redis não está pronto. Usando rate limit em memória (modo degradado)',
      )
      this.limiter = new RateLimiterMemory({
        points: this.defaultPoints,
        duration: this.defaultDuration,
        keyPrefix: 'rate-limit',
      })
    }
  }

  async consume(
    key: string,
    points?: number,
    duration?: number,
  ): Promise<ConsumeResult> {
    // Se houver configuração customizada, use (ou crie) limiter custom
    if (points !== undefined || duration !== undefined) {
      const customPoints = points ?? this.defaultPoints
      const customDuration = duration ?? this.defaultDuration
      const limiterKey = `custom-${customPoints}-${customDuration}`

      let limiter = this.customLimiters.get(limiterKey)
      if (!limiter) {
        if (this.limiter instanceof RateLimiterRedis) {
          limiter = new RateLimiterRedis({
            storeClient: this.redisService,
            keyPrefix: limiterKey,
            points: customPoints,
            duration: customDuration,
            insuranceLimiter: new RateLimiterMemory({
              points: customPoints,
              duration: customDuration,
              keyPrefix: limiterKey,
            }),
          })
        } else {
          limiter = new RateLimiterMemory({
            points: customPoints,
            duration: customDuration,
            keyPrefix: limiterKey,
          })
        }
        this.customLimiters.set(limiterKey, limiter)
      }
      return this._consumeLimiter(limiter, key, 1)
    }

    // Caso padrão: usa limiter global
    return this._consumeLimiter(this.limiter, key, 1)
  }

  private async _consumeLimiter(
    limiter: RateLimiterAbstract,
    key: string,
    points: number,
  ): Promise<ConsumeResult> {
    try {
      await limiter.consume(key, points)
      return {
        allowed: true,
        source: limiter instanceof RateLimiterRedis ? 'redis' : 'memory',
      }
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'msBeforeNext' in err &&
        typeof (err as RateLimiterRes).msBeforeNext === 'number'
      ) {
        return {
          allowed: false,
          retryAfter: (err as RateLimiterRes).msBeforeNext,
          source: limiter instanceof RateLimiterRedis ? 'redis' : 'memory',
        }
      }
      this.logger.error('Erro inesperado no rate limit:', err)
      throw err
    }
  }

  clearAll(): void {
    if ('_memoryStorage' in this.limiter) {
      this.limiter._memoryStorage = {}
    }
    this.customLimiters.clear()
  }
}
