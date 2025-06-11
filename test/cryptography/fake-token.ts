import { TokenRepository } from '@/infra/auth/token-repository'

export class FakeTokenService implements TokenRepository {
  async generateAccessToken(payload: { sub: string; role: string }) {
    const now = Math.floor(Date.now() / 1000)
    const exp = now + 60 * 60 // 1 hour

    const token = JSON.stringify({
      ...payload,
      iat: now,
      exp,
      typ: 'access',
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

    const token = JSON.stringify({
      ...payload,
      iat: now,
      exp,
      typ: 'refresh',
    })

    return { token, expiresIn: exp }
  }

  async generate(payload: Record<string, unknown>) {
    return JSON.stringify(payload)
  }
}
