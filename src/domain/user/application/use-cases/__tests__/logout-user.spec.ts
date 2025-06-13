import { describe, it, expect, beforeEach } from 'vitest'
import { LogoutUserUseCase } from '../logout-user'
import { FakeCacheService } from 'test/cache/fake-cache'
import { FakeRefreshTokenService } from 'test/cryptography/fake-refresh-token'
import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { makeUser } from 'test/factories/make-user'

let sut: LogoutUserUseCase
let fakeCacheService: FakeCacheService
let refreshTokenService: FakeRefreshTokenService
let inMemoryUsersRepository: InMemoryUsersRepository

describe('Logout', () => {
  beforeEach(() => {
    fakeCacheService = new FakeCacheService()
    refreshTokenService = new FakeRefreshTokenService(fakeCacheService)
    inMemoryUsersRepository = new InMemoryUsersRepository()

    sut = new LogoutUserUseCase(refreshTokenService, inMemoryUsersRepository)
  })

  it('should revoke the refresh token by jti', async () => {
    const user = makeUser({})

    await inMemoryUsersRepository.create(user)

    const result = await sut.execute({
      jti: 'fake-jti',
      userId: user.id.toString(),
    })

    expect(result.isRight()).toBe(true)
  })
})
