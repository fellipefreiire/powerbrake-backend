export abstract class MailRepository {
  abstract verify(): Promise<void>
  abstract send(params: {
    to: string
    subject: string
    html: string
  }): Promise<void>
}
