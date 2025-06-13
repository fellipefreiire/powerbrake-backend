import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/user-repository'
import { HashGenerator } from '@/shared/cryptography/hash-generator'
import { TokenVerifier } from '@/shared/cryptography/token-verifier'
import { left, right, type Either } from '@/core/either'
import { UserNotFoundError } from './errors/user-not-found'
import { UserUnauthorizedError } from './errors/user-unauthorized-error'
import { RefreshTokenRepository } from '@/infra/auth/refresh-token.repository'

type ResetPasswordRequest = {
  token: string
  password: string
}

type ResetPasswordResponse = Either<
  UserNotFoundError | UserUnauthorizedError,
  void
>

type ResetTokenPayload = {
  sub: string
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private tokenVerifier: TokenVerifier,
    private usersRepository: UsersRepository,
    private hashGenerator: HashGenerator,
    private refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute({
    token,
    password,
  }: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    let payload: ResetTokenPayload

    try {
      payload = this.tokenVerifier.verify<ResetTokenPayload>(token)
    } catch {
      return left(new UserUnauthorizedError())
    }

    const user = await this.usersRepository.findById(payload.sub)

    if (!user) {
      return left(new UserNotFoundError())
    }

    const passwordHash = await this.hashGenerator.hash(password)

    user.resetPassword(passwordHash)

    await this.usersRepository.save(user)
    await this.refreshTokenRepository.revokeAllForUser(user.id.toString())

    return right(undefined)
  }
}
