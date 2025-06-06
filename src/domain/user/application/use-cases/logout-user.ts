import { Injectable } from '@nestjs/common'
import { RefreshTokenRepository } from '@/infra/auth/refresh-token.repository'
import { left, right, type Either } from '@/core/either'
import { UserUnauthorizedError } from './errors/user-unauthorized-error'

type LogoutUserUseCaseRequest = {
  jti: string
}

type LogoutUserUseCaseResponse = Either<UserUnauthorizedError, null>

@Injectable()
export class LogoutUserUseCase {
  constructor(private refreshTokenRepository: RefreshTokenRepository) {}

  async execute({
    jti,
  }: LogoutUserUseCaseRequest): Promise<LogoutUserUseCaseResponse> {
    if (!jti) return left(new UserUnauthorizedError())

    await this.refreshTokenRepository.revoke(jti)

    return right(null)
  }
}
