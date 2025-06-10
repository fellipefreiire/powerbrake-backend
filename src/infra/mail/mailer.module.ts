import { Module } from '@nestjs/common'
import { ResendMailer } from './resend/resend-mailer'
import { MailRepository } from './mail-repository'

@Module({
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
