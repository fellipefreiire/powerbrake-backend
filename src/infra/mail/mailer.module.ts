import { Module } from '@nestjs/common'
import { ResendMailer } from './resend/resend-mailer'
import { MailRepository } from './mail-repository'
import { EnvModule } from '../env/env.module'
import { LoggerModule } from '../logger/logger.module'
import { LoggerRepository } from '../logger/winston/logger.repository'
import { Logger } from 'winston'

@Module({
  imports: [EnvModule, LoggerModule],
  providers: [
    ResendMailer,
    {
      provide: MailRepository,
      useClass: ResendMailer,
    },
    {
      provide: LoggerRepository,
      useClass: Logger,
    },
  ],
  exports: [MailRepository],
})
export class MailerModule {}
