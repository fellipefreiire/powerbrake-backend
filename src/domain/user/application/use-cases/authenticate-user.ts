import { left, right, type Either } from '@/core/either'
import { UsersRepository } from '@/domain/user/application/repositories/user-repository'
import { Injectable } from '@nestjs/common'
import { Encrypter } from '../../../../shared/cryptography/encrypter'
import { WrongCredentialsError } from './errors/wrong-credentials-error'
import { HashComparer } from '../../../../shared/cryptography/hash-comparer'
import { UserInactiveError } from './errors/user-inactive-error'

type AuthenticateUserUseCaseRequest = {
  email: string
  password: string
}

type AuthenticateUserUseCaseResponse = Either<
  WrongCredentialsError | UserInactiveError,
  {
    accessToken: string
    expiresIn: number
  }
>

export const expiresIn = 60 * 60 // 1 hour(s)

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashComparar: HashComparer,
    private encrypter: Encrypter,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUserUseCaseRequest): Promise<AuthenticateUserUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      return left(new WrongCredentialsError())
    }

    if (!user.isActive) {
      return left(new UserInactiveError())
    }

    const isPasswordValid = await this.hashComparar.compare(
      password,
      user.passwordHash,
    )

    if (!isPasswordValid) {
      return left(new WrongCredentialsError())
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user.id.toString(),
      role: user.role,
    })

    return right({
      accessToken,
      expiresIn: Math.floor(Date.now() / 1000) + expiresIn,
    })
  }
}
