import { describe, it, expect, beforeEach } from 'vitest'
import { LogoutUserUseCase } from '../logout-user'
import { FakeCacheService } from 'test/cache/fake-cache'
import { FakeRefreshTokenService } from 'test/cryptography/fake-refresh-token'

let sut: LogoutUserUseCase
let fakeCacheService: FakeCacheService
let refreshTokenService: FakeRefreshTokenService

describe('Logout', () => {
  beforeEach(() => {
    fakeCacheService = new FakeCacheService()
    refreshTokenService = new FakeRefreshTokenService(fakeCacheService)

    sut = new LogoutUserUseCase(refreshTokenService)
  })

  it('should revoke the refresh token by jti', async () => {
    const result = await sut.execute({ jti: 'fake-jti' })

    expect(result.isRight()).toBe(true)
  })
})
