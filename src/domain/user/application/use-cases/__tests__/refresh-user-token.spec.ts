import { RefreshUserTokenUseCase } from '@/domain/user/application/use-cases/refresh-user-token'
import { UserUnauthorizedError } from '@/domain/user/application/use-cases/errors/user-unauthorized-error'
import { TokenService } from '@/infra/auth/token.service'
import { RefreshTokenRepository } from '@/infra/auth/refresh-token.repository'
import { JwtService } from '@nestjs/jwt'
import type { RefreshTokenPayload } from '@/infra/auth/jwt.strategy'
import type { Role } from '@prisma/client'

let sut: RefreshUserTokenUseCase
let jwtService: JwtService
let tokenService: TokenService
let refreshTokenRepository: RefreshTokenRepository

const validPayload: RefreshTokenPayload = {
  sub: 'user-id-123',
  role: 'ADMIN' as Role,
  jti: 'jti-456',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
}

describe('RefreshUserTokenUseCase', () => {
  beforeEach(() => {
    jwtService = {
      verify: vi.fn(),
    } as unknown as JwtService

    tokenService = {
      generateAccessToken: vi.fn(),
    } as unknown as TokenService

    refreshTokenRepository = {
      validate: vi.fn(),
    } as unknown as RefreshTokenRepository

    sut = new RefreshUserTokenUseCase(
      jwtService,
      tokenService,
      refreshTokenRepository,
    )
  })

  it('should not allow refreshing if token is missing', async () => {
    const result = await sut.execute({ refreshToken: '' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserUnauthorizedError)
  })

  it('should not allow refreshing if token is invalid', async () => {
    vi.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new Error('invalid token')
    })

    const result = await sut.execute({ refreshToken: 'invalid.token' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserUnauthorizedError)
  })

  it('should not allow refreshing if jti is not valid in repository', async () => {
    vi.spyOn(jwtService, 'verify').mockReturnValue(validPayload)
    vi.spyOn(refreshTokenRepository, 'validate').mockResolvedValue(false)

    const result = await sut.execute({ refreshToken: 'valid.token' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserUnauthorizedError)
  })

  it('should generate new access token if refresh token is valid', async () => {
    vi.spyOn(jwtService, 'verify').mockReturnValue(validPayload)
    vi.spyOn(refreshTokenRepository, 'validate').mockResolvedValue(true)
    vi.spyOn(tokenService, 'generateAccessToken').mockResolvedValue({
      token: 'access-token-abc',
      expiresIn: 9999,
    })

    const result = await sut.execute({ refreshToken: 'valid.token' })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      accessToken: {
        token: 'access-token-abc',
        expiresIn: 9999,
      },
      refreshToken: {
        token: 'valid.token',
        expiresIn: validPayload.exp,
      },
      expiresIn: 9999,
    })
  })
})
