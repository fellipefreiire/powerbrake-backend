import { Module, Global } from '@nestjs/common'
import { WinstonLoggerProvider } from './winston.provider'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { AppLogger } from './logger.service'
import { RequestLoggingInterceptor } from './logger.interceptor'

@Global()
@Module({
  providers: [
    WinstonLoggerProvider,
    AppLogger,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
  ],
  exports: [AppLogger],
})
export class LoggerModule {}
