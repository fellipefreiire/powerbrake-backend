import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RefreshTokenRepository } from '@/infra/auth/refresh-token.repository'
import { LogoutUserUseCase } from '../logout-user'

let sut: LogoutUserUseCase
let refreshTokenRepository: RefreshTokenRepository

describe('Logout', () => {
  beforeEach(() => {
    refreshTokenRepository = {
      revoke: vi.fn().mockResolvedValue(undefined),
      create: vi.fn(),
      validate: vi.fn(),
    } as unknown as RefreshTokenRepository

    sut = new LogoutUserUseCase(refreshTokenRepository)
  })

  it('should revoke the refresh token by jti', async () => {
    const result = await sut.execute({ jti: 'fake-jti' })

    expect(refreshTokenRepository.revoke).toHaveBeenCalledWith('fake-jti')
    expect(result.isRight()).toBe(true)
  })
})
