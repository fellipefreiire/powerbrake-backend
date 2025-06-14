import type { LoggerRepository } from '@/infra/logger/winston/logger.repository'

export class FakeLogger implements LoggerRepository {
  public logs: string[] = []
  public warnings: string[] = []
  public errors: string[] = []
  public debugs: string[] = []

  info(message: string) {
    this.logger('info', message)
  }

  warn(message: string) {
    this.logger('warn', message)
  }

  error(message: string) {
    this.logger('error', message)
  }

  debug(message: string) {
    this.logger('debug', message)
  }

  private logger(level: 'info' | 'warn' | 'error' | 'debug', message: string) {
    switch (level) {
      case 'info':
        this.logs.push(message)
        break
      case 'warn':
        this.warnings.push(message)
        break
      case 'error':
        this.errors.push(message)
        break
      case 'debug':
        this.debugs.push(message)
        break
    }
  }

  clear() {
    this.logs = []
    this.warnings = []
    this.errors = []
    this.debugs = []
  }
}
