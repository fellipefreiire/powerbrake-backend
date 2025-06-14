export abstract class LoggerRepository {
  abstract info(msg: string, meta?: Record<string, unknown>): void
  abstract warn(msg: string, meta?: Record<string, unknown>): void
  abstract error(msg: string, meta?: Record<string, unknown>): void
  abstract debug(msg: string, meta?: Record<string, unknown>): void
}
