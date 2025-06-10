import { Injectable } from '@nestjs/common'
import { Resend } from 'resend'
import type { MailRepository } from '../mail-repository'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

@Injectable()
export class ResendMailer implements MailRepository {
  private client: Resend

  constructor() {
    this.client = new Resend(process.env.RESEND_API_KEY)
  }

  async send(params: SendEmailParams): Promise<void> {
    await this.client.emails.send({
      from: 'no-reply@yourdomain.com',
      to: params.to,
      subject: params.subject,
      html: params.html,
    })
  }
}
