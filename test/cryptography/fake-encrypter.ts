import type { Encrypter } from '@/shared/cryptography/encrypter'

export class FakeEncrypter implements Encrypter {
  public result = 'fake-token'
  public payload: Record<string, unknown> = {}

  async encrypt(payload: Record<string, unknown>): Promise<string> {
    this.payload = payload
    return this.result
  }
}
