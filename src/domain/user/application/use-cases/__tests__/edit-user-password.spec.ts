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

  it('should edit password when current password is valid', async () => {
    const user = makeUser({
      passwordHash: await hashGenerator.hash('correct-password'),
    })
    await usersRepository.create(user)

    const result = await sut.execute({
      userId: user.id.toString(),
      currentPassword: 'correct-password',
      newPassword: 'new-password',
    })

    expect(result.isRight()).toBe(true)
    expect(user.passwordHash).toBe('new-password-hashed')
  })

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await sut.execute({
      userId: 'non-existent-id',
      currentPassword: 'any-password',
      newPassword: 'new-password',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserNotFoundError)
  })

  it('should return UserUnauthorizedError if current password is invalid', async () => {
    const user = makeUser({ passwordHash: 'correct-hash' })
    await usersRepository.create(user)

    hashComparer.compare = vi.fn().mockResolvedValue(false)

    const result = await sut.execute({
      userId: user.id.toString(),
      currentPassword: 'wrong-password',
      newPassword: 'new-password',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserUnauthorizedError)
  })
})
