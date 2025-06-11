import { left, right, type Either } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserUnauthorizedError } from './errors/user-unauthorized-error'
import { RefreshTokenPayload } from '@/infra/auth/jwt.strategy'
import { RefreshTokenRepository } from '@/infra/auth/refresh-token.repository'
import { TokenRepository } from '@/infra/auth/token-repository'

type RefreshUserTokenUseCaseRequest = {
  refreshToken: string
}

type RefreshUserTokenUseCaseResponse = Either<
  UserUnauthorizedError,
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
export class RefreshUserTokenUseCase {
  constructor(
    private jwtService: JwtService,
    private tokenRepository: TokenRepository,
    private refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute({
    refreshToken,
  }: RefreshUserTokenUseCaseRequest): Promise<RefreshUserTokenUseCaseResponse> {
    if (!refreshToken) {
      return left(new UserUnauthorizedError())
    }

    let payload: RefreshTokenPayload

    try {
      payload = this.jwtService.verify(refreshToken)
    } catch {
      return left(new UserUnauthorizedError())
    }

    const isValid = await this.refreshTokenRepository.validate(payload.jti)

    if (!isValid) {
      return left(new UserUnauthorizedError())
    }

    const accessToken = await this.tokenRepository.generateAccessToken({
      sub: payload.sub,
      role: payload.role,
    })

    return right({
      accessToken,
      refreshToken: {
        token: refreshToken,
        expiresIn: payload.exp,
      },
      expiresIn: accessToken.expiresIn,
    })
  }
}
