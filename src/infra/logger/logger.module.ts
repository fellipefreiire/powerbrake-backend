import { Module, Global } from '@nestjs/common'
import { WinstonLoggerProvider } from './winston/winston.provider'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { LoggerService } from './winston/logger.service'
import { RequestLoggingInterceptor } from './winston/logger.interceptor'

@Global()
@Module({
  providers: [
    WinstonLoggerProvider,
    LoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
  ],
  exports: [LoggerService],
})
export class LoggerModule {}
