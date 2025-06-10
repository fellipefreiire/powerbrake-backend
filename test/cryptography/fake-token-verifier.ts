import type { TokenVerifier } from '@/shared/cryptography/token-verifier'

export class FakeTokenVerifier implements TokenVerifier {
  private tokenToPayloadMap = new Map<string, unknown>()

  setTokenPayload(token: string, payload: unknown): void {
    this.tokenToPayloadMap.set(token, payload)
  }

  verify<T = unknown>(token: string): T {
    const payload = this.tokenToPayloadMap.get(token)

    if (!payload) {
      throw new Error(`Invalid token: ${token}`)
    }

    return payload as T
  }
}
