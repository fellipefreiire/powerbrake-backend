import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { makeUser } from 'test/factories/make-user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UserNotFoundError } from '../errors/user-not-found'
import { FindUserByEmailUseCase } from '../find-user-by-email'

let inMemoryUsersRepository: InMemoryUsersRepository

let sut: FindUserByEmailUseCase

describe('Find User By Id', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()

    sut = new FindUserByEmailUseCase(inMemoryUsersRepository)
  })

  it('should be able to find a user by email', async () => {
    const user = makeUser(
      {
        email: 'johndoe@example.com',
      },
      new UniqueEntityID('user-1'),
    )

    await inMemoryUsersRepository.create(user)

    const result = await sut.execute({
      email: 'johndoe@example.com',
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
      email: 'johndoe2@example.com',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserNotFoundError)
  })
})
