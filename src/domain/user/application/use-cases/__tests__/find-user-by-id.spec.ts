import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { FindUserByIdUseCase } from '../find-user-by-id'
import { makeUser } from 'test/factories/make-user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UserNotFoundError } from '../errors/user-not-found'

let inMemoryUsersRepository: InMemoryUsersRepository

let sut: FindUserByIdUseCase

describe('Find User By Id', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()

    sut = new FindUserByIdUseCase(inMemoryUsersRepository)
  })

  it('should be able to find a user by id', async () => {
    const user = makeUser({}, new UniqueEntityID('user-1'))

    await inMemoryUsersRepository.create(user)

    const result = await sut.execute({
      id: 'user-1',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      data: expect.objectContaining({
        name: user.name,
        email: user.email,
      }),
    })
  })

  it('should not be able to find a non-existing user', async () => {
    const result = await sut.execute({
      id: 'user-2',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserNotFoundError)
  })
})
