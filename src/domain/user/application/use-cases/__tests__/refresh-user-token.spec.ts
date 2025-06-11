import { RefreshUserTokenUseCase } from '@/domain/user/application/use-cases/refresh-user-token'
import { UserUnauthorizedError } from '@/domain/user/application/use-cases/errors/user-unauthorized-error'
import { JwtService } from '@nestjs/jwt'
import type { RefreshTokenPayload } from '@/infra/auth/jwt.strategy'
import type { Role } from '@prisma/client'
import { FakeCacheService } from 'test/cache/fake-cache'
import { FakeRefreshTokenService } from 'test/cryptography/fake-refresh-token'
import { FakeTokenService } from 'test/cryptography/fake-token'

let sut: RefreshUserTokenUseCase
let jwtService: JwtService
let fakeTokenService: FakeTokenService
let fakeCacheService: FakeCacheService
let refreshTokenService: FakeRefreshTokenService

const validPayload: RefreshTokenPayload = {
  sub: 'user-id-123',
  role: 'ADMIN' as Role,
  jti: 'jti-456',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
}

describe('Refresh User Token', () => {
  beforeEach(() => {
    jwtService = {
      verify: vi.fn(),
    } as unknown as JwtService

    fakeTokenService = new FakeTokenService()
    fakeCacheService = new FakeCacheService()
    refreshTokenService = new FakeRefreshTokenService(fakeCacheService)

    sut = new RefreshUserTokenUseCase(
      jwtService,
      fakeTokenService,
      refreshTokenService,
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
    vi.spyOn(refreshTokenService, 'validate').mockResolvedValue(false)

    const result = await sut.execute({ refreshToken: 'valid.token' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserUnauthorizedError)
  })

  it('should generate new access token if refresh token is valid', async () => {
    vi.spyOn(jwtService, 'verify').mockReturnValue(validPayload)
    vi.spyOn(refreshTokenService, 'validate').mockResolvedValue(true)
    vi.spyOn(fakeTokenService, 'generateAccessToken').mockResolvedValue({
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
