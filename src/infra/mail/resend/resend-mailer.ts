import { HttpException, Injectable } from '@nestjs/common'
import { Resend } from 'resend'
import type { MailRepository } from '../mail-repository'
import { EnvService } from '@/infra/env/env.service'
import { withTimeout } from '@/shared/utils/with-timeout'
import { retryWithBackoff } from '@/shared/utils/retry-with-backoff'
import { LoggerService } from '@/infra/logger/winston/logger.service'
import { BrokenCircuitError } from 'cockatiel'
import { createCircuitBreaker } from '@/shared/utils/circuit-breaker'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

@Injectable()
export class ResendMailer implements MailRepository {
  private client: Resend
  private readonly timeout: number
  private readonly retryAttempts: number
  private readonly retryBackoffMs: number
  private breaker: ReturnType<typeof createCircuitBreaker>

  constructor(
    envService: EnvService,
    private logger: LoggerService,
  ) {
    this.client = new Resend(envService.get('RESEND_API_KEY'))
    this.timeout = envService.get('EMAIL_SEND_TIMEOUT')
    this.retryAttempts = envService.get('EMAIL_RETRY_ATTEMPTS')
    this.retryBackoffMs = envService.get('EMAIL_RETRY_BACKOFF')

    this.breaker = createCircuitBreaker('email', this.logger)
  }

  async send(params: SendEmailParams): Promise<void> {
    try {
      await this.breaker.execute(() =>
        retryWithBackoff(
          () =>
            withTimeout(
              this.client.emails.send({
                from: 'onboarding@resend.dev',
                to: params.to,
                subject: params.subject,
                html: params.html,
              }),
              this.timeout,
            ),
          {
            retries: this.retryAttempts,
            initialDelayMs: this.retryBackoffMs,
            factor: 2,
            onRetry: (err, attempt) => {
              this.logger.warn(
                `[Email] retry #${attempt} after error: ${String(err)}`,
              )
            },
          },
        ),
      )
    } catch (e) {
      if (e instanceof BrokenCircuitError) {
        this.logger.error(
          'Serviço de e-mail indisponível (circuit breaker aberto)',
        )
        throw new HttpException('Serviço de e-mail indisponível', 503)
      }
      throw e
    }
  }

  async verify(): Promise<void> {
    try {
      await this.breaker.execute(() =>
        retryWithBackoff(
          () =>
            withTimeout(
              this.client.emails.send({
                to: 'healthcheck@example.com',
                from: 'no-reply@example.com',
                subject: '[HealthCheck] Email',
                html: '<p>Health check</p>',
              }),
              this.timeout,
            ),
          {
            retries: this.retryAttempts,
            initialDelayMs: this.retryBackoffMs,
            factor: 2,
            onRetry: (err, attempt) => {
              this.logger.warn(
                `[verify] Email retry #${attempt} after error: ${String(err)}`,
              )
            },
          },
        ),
      )
    } catch (e) {
      if (e instanceof BrokenCircuitError) {
        this.logger.error(
          'Serviço de e-mail indisponível (circuit breaker aberto)',
        )
        throw new HttpException('Serviço de e-mail indisponível', 503)
      }
      throw e
    }
  }
}
