import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { EditUserUseCase } from '../edit-user'
import { makeUser } from 'test/factories/make-user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryUserAvatarRepository } from 'test/repositories/user/in-memory-user-avatar-repository'
import { InMemoryAvatarRepository } from 'test/repositories/avatar/in-memory-avatar-repository'
import { makeAvatar } from 'test/factories/make-avatar'
import { UserNotFoundError } from '../errors'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryAvatarRepository: InMemoryAvatarRepository
let inMemoryUserAvatarRepository: InMemoryUserAvatarRepository

let sut: EditUserUseCase

describe('Edit User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryUserAvatarRepository = new InMemoryUserAvatarRepository()
    inMemoryAvatarRepository = new InMemoryAvatarRepository()

    sut = new EditUserUseCase(
      inMemoryUsersRepository,
      inMemoryUserAvatarRepository,
    )
  })

  it('should be able to edit a user', async () => {
    const user = makeUser({}, new UniqueEntityID('user-1'))
    const avatar = makeAvatar({}, new UniqueEntityID('avatar-1'))

    await inMemoryUsersRepository.create(user)
    await inMemoryAvatarRepository.create(avatar)

    const result = await sut.execute({
      id: user.id.toString(),
      name: 'New Name',
      avatarId: avatar.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.data.name).toBe('New Name')
      expect(result.value.data.avatarId?.toString()).toBe('avatar-1')
    }

    const attached = inMemoryUserAvatarRepository.items.find(
      (ua) =>
        ua.userId.toString() === 'user-1' &&
        ua.avatarId.toString() === 'avatar-1',
    )

    expect(attached).toBeDefined()
  })

  it('should return error if user does not exist', async () => {
    const result = await sut.execute({
      id: 'user-01',
      name: 'Any',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserNotFoundError)
  })
})
