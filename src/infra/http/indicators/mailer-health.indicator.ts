import { Injectable } from '@nestjs/common'
import { type HealthIndicatorResult } from '@nestjs/terminus'
import { MailRepository } from '@/infra/mail/mail-repository'

@Injectable()
export class MailHealthIndicator {
  constructor(private readonly mailer: MailRepository) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.mailer.verify()
      return {
        [key]: { status: 'up' },
      }
    } catch (error) {
      console.error('Mail Health Check failed:', error)
      return {
        [key]: { status: 'down' },
      }
    }
  }
}
