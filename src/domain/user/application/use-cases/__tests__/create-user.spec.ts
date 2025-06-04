import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { CreateUserUseCase } from '../create-user'
import { makeUser } from 'test/factories/make-user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'
import { FakeHasher } from 'test/cryptography/fake-hasher'

let inMemoryUsersRepository: InMemoryUsersRepository
let fakeHasher: FakeHasher

let sut: CreateUserUseCase

describe('Create User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    fakeHasher = new FakeHasher()

    sut = new CreateUserUseCase(inMemoryUsersRepository, fakeHasher)
  })

  it('should be able to create a new user', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'OPERATOR',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      data: inMemoryUsersRepository.items[0],
    })
  })

  it('should hash user password upon registration', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'OPERATOR',
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
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })
})
