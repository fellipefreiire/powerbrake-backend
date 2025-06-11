import { describe, beforeEach, it, expect } from 'vitest'
import { AuthenticateUserUseCase } from '@/domain/user/application/use-cases/authenticate-user'
import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { makeUser } from 'test/factories/make-user'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { Role } from '@prisma/client'
import { FakeCacheService } from 'test/cache/fake-cache'
import { FakeRefreshTokenService } from 'test/cryptography/fake-refresh-token'
import { FakeTokenService } from 'test/cryptography/fake-token'

let sut: AuthenticateUserUseCase
let usersRepository: InMemoryUsersRepository
let hasher: FakeHasher
let fakeTokenService: FakeTokenService
let fakeCacheService: FakeCacheService
let refreshTokenService: FakeRefreshTokenService

describe('Authenticate User', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    hasher = new FakeHasher()
    fakeTokenService = new FakeTokenService()
    fakeCacheService = new FakeCacheService()
    refreshTokenService = new FakeRefreshTokenService(fakeCacheService)

    sut = new AuthenticateUserUseCase(
      usersRepository,
      hasher,
      fakeTokenService,
      refreshTokenService,
    )
  })

  it('should be able to authenticate a user and return tokens', async () => {
    const user = makeUser({
      email: 'johndoe@example.com',
      passwordHash: await hasher.hash('123456'),
      role: 'OPERATOR' as Role,
    })

    await usersRepository.create(user)

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      const value = result.value
      expect(value.accessToken).toHaveProperty('token')
      expect(value.accessToken).toHaveProperty('expiresIn')
      expect(typeof value.accessToken.token).toBe('string')
      expect(typeof value.accessToken.expiresIn).toBe('number')

      expect(value.refreshToken).toHaveProperty('token')
      expect(value.refreshToken).toHaveProperty('expiresIn')
      expect(typeof value.refreshToken.token).toBe('string')
      expect(typeof value.refreshToken.expiresIn).toBe('number')

      expect(typeof value.expiresIn).toBe('number')
    }
  })
})
