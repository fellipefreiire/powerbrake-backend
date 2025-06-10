import { Module } from '@nestjs/common'

import { JwtEncrypter } from './jwt-encrypter'
import { BcryptHasher } from './bcrypt-hasher'
import { Encrypter } from '@/shared/cryptography/encrypter'
import { HashComparer } from '@/shared/cryptography/hash-comparer'
import { HashGenerator } from '@/shared/cryptography/hash-generator'
import { TokenVerifier } from '@/shared/cryptography/token-verifier'
import { JwtVerifier } from './jwt-verifier'

@Module({
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
    { provide: TokenVerifier, useClass: JwtVerifier },
  ],
  exports: [Encrypter, HashComparer, HashGenerator, TokenVerifier],
})
export class CryptographyModule {}
