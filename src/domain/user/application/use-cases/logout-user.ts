import { Injectable } from '@nestjs/common'
import { left, right, type Either } from '@/core/either'
import { UserUnauthorizedError } from './errors/user-unauthorized-error'
import { RefreshTokenRepository } from '@/infra/auth/refresh-token.repository'
import { UsersRepository } from '../repositories/user-repository'

type LogoutUserUseCaseRequest = {
  jti: string
  userId: string
}

type LogoutUserUseCaseResponse = Either<UserUnauthorizedError, null>

@Injectable()
export class LogoutUserUseCase {
  constructor(
    private refreshTokenRepository: RefreshTokenRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    jti,
    userId,
  }: LogoutUserUseCaseRequest): Promise<LogoutUserUseCaseResponse> {
    if (!jti) return left(new UserUnauthorizedError())

    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new UserUnauthorizedError())
    }

    await this.refreshTokenRepository.revoke(jti)

    user.logout()
    await this.usersRepository.dispatchEvent(user.id)

    return right(null)
  }
}
