import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { EditUserUseCase } from '../edit-user'
import { makeUser } from 'test/factories/make-user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryUserAvatarRepository } from 'test/repositories/user/in-memory-user-avatar-repository'
import { InMemoryAvatarRepository } from 'test/repositories/avatar/in-memory-avatar-repository'
import { makeAvatar } from 'test/factories/make-avatar'
import { UserNotFoundError } from '../errors'
import { InMemoryUserAddressRepository } from 'test/repositories/user/in-memory-user-address-repository'
import { Address } from '@/shared/address/enterprise/entities/address'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryAvatarRepository: InMemoryAvatarRepository
let inMemoryUserAvatarRepository: InMemoryUserAvatarRepository
let inMemoryUserAddressRepository: InMemoryUserAddressRepository

let sut: EditUserUseCase

describe('Edit User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryUserAvatarRepository = new InMemoryUserAvatarRepository()
    inMemoryAvatarRepository = new InMemoryAvatarRepository()
    inMemoryUserAddressRepository = new InMemoryUserAddressRepository()

    sut = new EditUserUseCase(
      inMemoryUsersRepository,
      inMemoryUserAvatarRepository,
      inMemoryUserAddressRepository,
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
      addresses: [
        {
          street: 'Rua A',
          number: '123',
          neighborhood: 'Bairro B',
          city: 'Cidade C',
          state: 'Estado D',
          zipCode: '00000-000',
        },
      ],
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
      addresses: [
        {
          street: 'Rua A',
          number: '123',
          neighborhood: 'Bairro B',
          city: 'Cidade C',
          state: 'Estado D',
          zipCode: '00000-000',
        },
      ],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserNotFoundError)
  })

  it('should update user name and avatar, and replace existing address with a new one', async () => {
    const userId = new UniqueEntityID('user-1')

    const oldAddress = Address.create({
      street: 'Old Street',
      number: '101',
      neighborhood: 'Old Neighborhood',
      city: 'Old City',
      state: 'Old State',
      zipCode: '99999-999',
      complement: null,
      userId,
    })

    const user = makeUser(
      {
        name: 'Original Name',
        addresses: [oldAddress],
      },
      userId,
    )

    const avatar = makeAvatar({}, new UniqueEntityID('avatar-1'))

    await inMemoryUsersRepository.create(user)
    await inMemoryAvatarRepository.create(avatar)
    await inMemoryUserAddressRepository.upsertManyForUser(
      user.id.toString(),
      user.addresses.getItems(),
    )

    const result = await sut.execute({
      id: user.id.toString(),
      name: 'Updated Name',
      avatarId: avatar.id.toString(),
      addresses: [
        {
          street: 'New Street',
          number: '202',
          neighborhood: 'New Neighborhood',
          city: 'New City',
          state: 'New State',
          zipCode: '11111-111',
        },
      ],
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.data.name).toBe('Updated Name')
      expect(result.value.data.avatarId?.toString()).toBe('avatar-1')
    }

    const newAddresses = await inMemoryUserAddressRepository.findManyByUserId(
      user.id.toString(),
    )

    expect(newAddresses).toHaveLength(1)
    expect(newAddresses[0].street).toBe('New Street')

    const attached = inMemoryUserAvatarRepository.items.find(
      (ua) =>
        ua.userId.toString() === user.id.toString() &&
        ua.avatarId.toString() === 'avatar-1',
    )

    expect(attached).toBeDefined()
  })
})
