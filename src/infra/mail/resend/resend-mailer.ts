import { Injectable } from '@nestjs/common'
import { Resend } from 'resend'
import type { MailRepository } from '../mail-repository'
import { EnvService } from '@/infra/env/env.service'
import { withTimeout } from '@/shared/utils/with-timeout'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

@Injectable()
export class ResendMailer implements MailRepository {
  private client: Resend
  private readonly timeout: number

  constructor(envService: EnvService) {
    this.client = new Resend(envService.get('RESEND_API_KEY'))
    this.timeout = envService.get('EMAIL_SEND_TIMEOUT')
  }

  async send(params: SendEmailParams): Promise<void> {
    await withTimeout(
      this.client.emails.send({
        from: 'onboarding@resend.dev',
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
      this.timeout,
    )
  }

  async verify(): Promise<void> {
    await withTimeout(
      this.client.emails.send({
        to: 'healthcheck@example.com',
        from: 'no-reply@example.com',
        subject: '[HealthCheck] Email',
        html: '<p>Health check</p>',
      }),
      this.timeout,
    )
  }
}
