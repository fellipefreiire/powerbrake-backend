import { Encrypter } from '@/shared/cryptography/encrypter'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtEncrypter implements Encrypter {
  constructor(private jwtService: JwtService) {}

  encrypt(
    payload: Record<string, unknown>,
    expiresInSeconds: number = 60 * 60,
  ): Promise<string> {
    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + expiresInSeconds

    return this.jwtService.signAsync({
      ...payload,
      iat,
      exp,
    })
  }
}
