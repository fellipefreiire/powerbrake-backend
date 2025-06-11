import { left, right, type Either } from '@/core/either'
import { UsersRepository } from '@/domain/user/application/repositories/user-repository'
import { Injectable } from '@nestjs/common'
import { WrongCredentialsError } from './errors/wrong-credentials-error'
import { HashComparer } from '../../../../shared/cryptography/hash-comparer'
import { UserInactiveError } from './errors/user-inactive-error'
import { RefreshTokenRepository } from '@/infra/auth/refresh-token.repository'
import { TokenRepository } from '@/infra/auth/token-repository'

type AuthenticateUserUseCaseRequest = {
  email: string
  password: string
}

type AuthenticateUserUseCaseResponse = Either<
  WrongCredentialsError | UserInactiveError,
  {
    accessToken: {
      token: string
      expiresIn: number
    }
    refreshToken: {
      token: string
      expiresIn: number
    }
    expiresIn: number
  }
>

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashComparar: HashComparer,
    private tokenRepository: TokenRepository,
    private refreshTokenRepository: RefreshTokenRepository,
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

    const accessToken = await this.tokenRepository.generateAccessToken({
      sub: user.id.toString(),
      role: user.role,
    })

    const jti = await this.refreshTokenRepository.create(user.id.toString())

    const refreshToken = await this.tokenRepository.generateRefreshToken({
      sub: user.id.toString(),
      role: user.role,
      jti,
    })

    return right({
      accessToken,
      refreshToken,
      expiresIn: accessToken.expiresIn,
    })
  }
}
