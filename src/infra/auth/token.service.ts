import { Injectable } from '@nestjs/common'
import { Encrypter } from '@/shared/cryptography/encrypter'

@Injectable()
export class TokenService {
  constructor(private encrypter: Encrypter) {}

  async generateAccessToken(payload: { sub: string; role: string }) {
    const now = Math.floor(Date.now() / 1000)
    const exp = now + 60 * 60 // 1 hour

    const token = await this.encrypter.encrypt({
      ...payload,
      iat: now,
      exp,
    })

    return { token, expiresIn: exp }
  }

  async generateRefreshToken(payload: {
    sub: string
    role: string
    jti: string
  }) {
    const now = Math.floor(Date.now() / 1000)
    const exp = now + 60 * 60 * 24 * 7 // 7 days

    const token = await this.encrypter.encrypt({
      ...payload,
      iat: now,
      exp,
    })

    return { token, expiresIn: exp }
  }

  async generate(payload: Record<string, unknown>) {
    return this.encrypter.encrypt(payload)
  }
}
