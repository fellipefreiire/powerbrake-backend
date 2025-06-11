import { Injectable } from '@nestjs/common'
import { RefreshTokenService } from '@/infra/auth/refresh-token.service'
import { left, right, type Either } from '@/core/either'
import { UserUnauthorizedError } from './errors/user-unauthorized-error'

type LogoutUserUseCaseRequest = {
  jti: string
}

type LogoutUserUseCaseResponse = Either<UserUnauthorizedError, null>

@Injectable()
export class LogoutUserUseCase {
  constructor(private refreshTokenService: RefreshTokenService) {}

  async execute({
    jti,
  }: LogoutUserUseCaseRequest): Promise<LogoutUserUseCaseResponse> {
    if (!jti) return left(new UserUnauthorizedError())

    await this.refreshTokenService.revoke(jti)

    return right(null)
  }
}
