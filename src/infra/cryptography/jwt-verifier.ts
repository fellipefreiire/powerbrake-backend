import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { TokenVerifier } from '@/shared/cryptography/token-verifier'

@Injectable()
export class JwtVerifier implements TokenVerifier {
  constructor(private jwt: JwtService) {}

  verify<T extends object = Record<string, unknown>>(token: string): T {
    return this.jwt.verify<T>(token)
  }
}
