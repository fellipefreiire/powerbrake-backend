import { Module } from '@nestjs/common'
import { ResendMailer } from './resend/resend-mailer'
import { MailRepository } from './mail-repository'
import { EnvModule } from '../env/env.module'
import { LoggerModule } from '../logger/logger.module'

@Module({
  imports: [EnvModule, LoggerModule],
  providers: [
    ResendMailer,
    {
      provide: MailRepository,
      useClass: ResendMailer,
    },
  ],
  exports: [MailRepository],
})
export class MailerModule {}
