import { Either, left, right } from '@/core/either'
import { UserNotFoundError } from './errors'
import { UserUnauthorizedError } from './errors/user-unauthorized-error'
import { UsersRepository } from '../repositories/user-repository'
import { HashComparer } from '@/shared/cryptography/hash-comparer'
import { HashGenerator } from '@/shared/cryptography/hash-generator'
import { RefreshTokenRepository } from '@/infra/auth/refresh-token.repository'
import { Injectable } from '@nestjs/common'

interface EditUserPasswordUseCaseRequest {
  userId: string
  currentPassword: string
  newPassword: string
  currentJti: string
}

type EditUserPasswordUseCaseResponse = Either<
  UserNotFoundError | UserUnauthorizedError,
  void
>

@Injectable()
export class EditUserPasswordUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashComparer: HashComparer,
    private hashGenerator: HashGenerator,
    private refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute({
    userId,
    currentPassword,
    newPassword,
    currentJti,
  }: EditUserPasswordUseCaseRequest): Promise<EditUserPasswordUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new UserNotFoundError())
    }

    const isPasswordValid = await this.hashComparer.compare(
      currentPassword,
      user.passwordHash,
    )

    if (!isPasswordValid) {
      return left(new UserUnauthorizedError())
    }

    const newPasswordHash = await this.hashGenerator.hash(newPassword)
    user.updatePassword(newPasswordHash)

    await this.usersRepository.save(user)

    await this.refreshTokenRepository.revokeAllForUserExcept(userId, currentJti)

    return right(undefined)
  }
}
