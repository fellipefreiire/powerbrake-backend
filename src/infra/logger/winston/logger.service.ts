import { Injectable, Inject } from '@nestjs/common'
import { Logger } from 'winston'
import { WINSTON_LOGGER } from './winston.token'
import type { LoggerRepository } from './logger.repository'

@Injectable()
export class LoggerService implements LoggerRepository {
  constructor(@Inject(WINSTON_LOGGER) private readonly logger: Logger) {}

  info(msg: string, meta: Record<string, unknown> = {}) {
    this.logger.info(msg, meta)
  }

  warn(msg: string, meta: Record<string, unknown> = {}) {
    this.logger.warn(msg, meta)
  }

  error(msg: string, meta: Record<string, unknown> = {}) {
    this.logger.error(msg, meta)
  }

  debug(msg: string, meta: Record<string, unknown> = {}) {
    this.logger.debug(msg, meta)
  }
}
