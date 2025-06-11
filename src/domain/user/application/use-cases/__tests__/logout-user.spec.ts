import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RefreshTokenService } from '@/infra/auth/refresh-token.service'
import { LogoutUserUseCase } from '../logout-user'

let sut: LogoutUserUseCase
let refreshTokenService: RefreshTokenService

describe('Logout', () => {
  beforeEach(() => {
    refreshTokenService = {
      revoke: vi.fn().mockResolvedValue(undefined),
      create: vi.fn(),
      validate: vi.fn(),
    } as unknown as RefreshTokenService

    sut = new LogoutUserUseCase(refreshTokenService)
  })

  it('should revoke the refresh token by jti', async () => {
    const result = await sut.execute({ jti: 'fake-jti' })

    expect(refreshTokenService.revoke).toHaveBeenCalledWith('fake-jti')
    expect(result.isRight()).toBe(true)
  })
})
