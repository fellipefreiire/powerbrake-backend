export abstract class MailRepository {
  abstract send(params: {
    to: string
    subject: string
    html: string
  }): Promise<void>
}
