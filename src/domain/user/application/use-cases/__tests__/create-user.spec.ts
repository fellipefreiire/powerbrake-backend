import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { CreateUserUseCase } from '../create-user'
import { makeUser } from 'test/factories/make-user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { InMemoryUserAddressRepository } from 'test/repositories/user/in-memory-user-address-repository'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryUserAddressRepository: InMemoryUserAddressRepository
let fakeHasher: FakeHasher

let sut: CreateUserUseCase

describe('Create User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryUserAddressRepository = new InMemoryUserAddressRepository()
    fakeHasher = new FakeHasher()

    sut = new CreateUserUseCase(
      inMemoryUsersRepository,
      fakeHasher,
      inMemoryUserAddressRepository,
    )
  })

  it('should be able to create a new user', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'OPERATOR',
      addresses: [
        {
          street: 'Rua A',
          number: '123',
          neighborhood: 'Centro',
          complement: null,
          city: 'Petrolina',
          state: 'PE',
          zipCode: '56300-000',
        },
        {
          street: 'Rua B',
          number: '456',
          neighborhood: 'Centro',
          complement: 'Casa 2',
          city: 'Petrolina',
          state: 'PE',
          zipCode: '56300-001',
        },
      ],
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      data: inMemoryUsersRepository.items[0],
    })
    if (result.isRight()) {
      expect(result.value.data.addresses.getItems()).toHaveLength(2)
    }
  })

  it('should hash user password upon registration', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'OPERATOR',
      addresses: [
        {
          street: 'Rua A',
          number: '123',
          neighborhood: 'Centro',
          complement: null,
          city: 'Petrolina',
          state: 'PE',
          zipCode: '56300-000',
        },
      ],
    })

    expect(result.isRight()).toBe(true)

    const passwordHash = inMemoryUsersRepository.items[0].passwordHash

    const isPasswordCorrectlyHashed = await fakeHasher.compare(
      '123456',
      passwordHash,
    )

    expect(result.isRight()).toBe(true)
    expect(isPasswordCorrectlyHashed).toBe(true)
  })

  it('should not be able to create a new user with already existing email', async () => {
    const alreadyExistingUser = makeUser(
      {
        email: 'johndoe@example.com',
      },
      new UniqueEntityID('user-1'),
    )

    await inMemoryUsersRepository.create(alreadyExistingUser)

    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'OPERATOR',
      addresses: [
        {
          street: 'Rua B',
          number: '456',
          neighborhood: 'Centro',
          complement: 'Casa 2',
          city: 'Petrolina',
          state: 'PE',
          zipCode: '56300-001',
        },
      ],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })
})
