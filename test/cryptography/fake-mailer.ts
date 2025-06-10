import type { MailRepository } from '@/infra/mail/mail-repository'

export class FakeMailer implements MailRepository {
  public sent: Array<{ to: string; subject: string; html: string }> = []

  async send(data: {
    to: string
    subject: string
    html: string
  }): Promise<void> {
    this.sent.push(data)
  }
}
