import { EnvService } from '@/infra/env/env.service'
import { Injectable } from '@nestjs/common'
import { Redis } from 'ioredis'

@Injectable()
export class RedisService extends Redis {
  private _commandTimeout: number

  constructor(envService: EnvService) {
    super({
      host: envService.get('REDIS_HOST'),
      port: envService.get('REDIS_PORT'),
      db: envService.get('REDIS_DB'),
      connectTimeout: envService.get('REDIS_COMMAND_TIMEOUT'),
    })

    this._commandTimeout = envService.get('REDIS_COMMAND_TIMEOUT')
  }

  get commandTimeout() {
    return this._commandTimeout
  }

  onModuleDestroy() {
    return this.disconnect()
  }
}
