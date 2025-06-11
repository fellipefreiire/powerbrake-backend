import { describe, it, expect, beforeEach } from 'vitest'
import { EditUserPasswordUseCase } from '../edit-user-password'
import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { makeUser } from 'test/factories/make-user'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { UserNotFoundError } from '../errors'
import { UserUnauthorizedError } from '../errors/user-unauthorized-error'
import { FakeRefreshTokenService } from 'test/cryptography/fake-refresh-token'
import { FakeCacheService } from 'test/cache/fake-cache'

let usersRepository: InMemoryUsersRepository
let hashComparer: FakeHasher
let hashGenerator: FakeHasher
let fakeCacheService: FakeCacheService
let refreshTokenService: FakeRefreshTokenService
let sut: EditUserPasswordUseCase

describe('Edit User Password', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    hashComparer = new FakeHasher()
    hashGenerator = new FakeHasher()
    fakeCacheService = new FakeCacheService()
    refreshTokenService = new FakeRefreshTokenService(fakeCacheService)

    sut = new EditUserPasswordUseCase(
      usersRepository,
      hashComparer,
      hashGenerator,
      refreshTokenService,
    )
  })

  it('should update the password and revoke other sessions', async () => {
    const user = makeUser({
      passwordHash: await hashGenerator.hash('old-pass'),
    })
    await usersRepository.create(user)

    const result = await sut.execute({
      userId: user.id.toString(),
      currentPassword: 'old-pass',
      newPassword: 'new-pass',
      currentJti: 'current-jti',
    })

    expect(result.isRight()).toBe(true)

    const updated = await usersRepository.findById(user.id.toString())
    const passwordMatch = await hashComparer.compare(
      'new-pass',
      updated!.passwordHash,
    )

    expect(passwordMatch).toBe(true)
  })

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await sut.execute({
      userId: 'non-existent-id',
      currentPassword: 'any-password',
      newPassword: 'new-password',
      currentJti: 'current-jti',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserNotFoundError)
  })

  it('should return UserUnauthorizedError if current password is invalid', async () => {
    const user = makeUser({
      passwordHash: await hashGenerator.hash('correct-password'),
    })
    await usersRepository.create(user)

    hashComparer.compare = vi.fn().mockResolvedValue(false)

    const result = await sut.execute({
      userId: user.id.toString(),
      currentPassword: 'wrong-password',
      newPassword: 'new-password',
      currentJti: 'current-jti',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserUnauthorizedError)
  })

  it('should revoke all other sessions except current', async () => {
    const user = makeUser({
      passwordHash: await hashGenerator.hash('old-pass'),
    })
    await usersRepository.create(user)

    await fakeCacheService.set('refresh_token:abc', user.id.toString())
    await fakeCacheService.set('refresh_token:def', user.id.toString())
    await fakeCacheService.set('refresh_token:ghi', 'another-user-id')

    const result = await sut.execute({
      userId: user.id.toString(),
      currentPassword: 'old-pass',
      newPassword: 'new-pass',
      currentJti: 'def',
    })

    expect(result.isRight()).toBe(true)

    const remainingKeys = await fakeCacheService.keys('refresh_token:*')
    expect(remainingKeys).toContain('refresh_token:def')
    expect(remainingKeys).not.toContain('refresh_token:abc')
    expect(remainingKeys).toContain('refresh_token:ghi')
  })
})
