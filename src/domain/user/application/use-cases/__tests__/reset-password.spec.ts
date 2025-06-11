import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeUser } from 'test/factories/make-user'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { FakeTokenVerifier } from 'test/cryptography/fake-token-verifier'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { ResetPasswordUseCase } from '../reset-password'
import { UserNotFoundError } from '../errors'
import { UserUnauthorizedError } from '../errors/user-unauthorized-error'
import { RefreshTokenService } from '@/infra/auth/refresh-token.service'
import { RedisService } from '@/infra/cache/redis/redis.service'

let usersRepository: InMemoryUsersRepository
let tokenVerifier: FakeTokenVerifier
let hashGenerator: FakeHasher
let refreshTokenService: RefreshTokenService
let sut: ResetPasswordUseCase

const fakeToken = 'valid.token'
const fakeUserId = 'user-123'
const fakePassword = 'NovaSenha@123'
const expectedHash = fakePassword.concat('-hashed')

describe('Reset Password', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    tokenVerifier = new FakeTokenVerifier()
    hashGenerator = new FakeHasher()

    const redisMock = {
      set: vi.fn(),
      get: vi.fn(),
      del: vi.fn(),
      keys: vi.fn().mockResolvedValue([]),
    } as unknown as RedisService

    refreshTokenService = new RefreshTokenService(redisMock)

    sut = new ResetPasswordUseCase(
      tokenVerifier,
      usersRepository,
      hashGenerator,
      refreshTokenService,
    )
  })

  it('should reset password when token is valid and user exists', async () => {
    const user = makeUser({}, new UniqueEntityID(fakeUserId))
    await usersRepository.create(user)

    tokenVerifier.setTokenPayload(fakeToken, { sub: fakeUserId })

    const result = await sut.execute({
      token: fakeToken,
      password: fakePassword,
    })

    expect(result.isRight()).toBe(true)
    expect(user.passwordHash).toBe(expectedHash)
  })

  it('should return UserNotFoundError if user does not exist', async () => {
    tokenVerifier.setTokenPayload(fakeToken, { sub: fakeUserId })

    const result = await sut.execute({
      token: fakeToken,
      password: fakePassword,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserNotFoundError)
  })

  it('should return UserUnauthorizedError if token is invalid', async () => {
    const result = await sut.execute({
      token: 'invalid.token',
      password: fakePassword,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserUnauthorizedError)
  })

  it('should reset the password and revoke all refresh tokens', async () => {
    const user = makeUser({
      email: 'john@example.com',
      passwordHash: 'old-hash',
    })
    await usersRepository.create(user)

    tokenVerifier.setTokenPayload(fakeToken, { sub: user.id.toString() })

    const revokeSpy = vi
      .spyOn(refreshTokenService, 'revokeAllForUser')
      .mockResolvedValue()

    const result = await sut.execute({
      token: fakeToken,
      password: 'new-password',
    })

    expect(result.isRight()).toBe(true)

    const updatedUser = await usersRepository.findById(user.id.toString())
    expect(updatedUser?.passwordHash).toBe('new-password-hashed')

    expect(revokeSpy).toHaveBeenCalledWith(user.id.toString())
  })
})
