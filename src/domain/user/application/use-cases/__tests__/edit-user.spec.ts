import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { EditUserUseCase } from '../edit-user'
import { makeUser } from 'test/factories/make-user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let inMemoryUsersRepository: InMemoryUsersRepository

let sut: EditUserUseCase

describe('Edit User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()

    sut = new EditUserUseCase(inMemoryUsersRepository)
  })

  it('should be able to edit a user', async () => {
    const user = makeUser(
      {
        name: 'John Doe',
        email: 'johndoe@example.com',
      },
      new UniqueEntityID('user-1'),
    )

    await inMemoryUsersRepository.create(user)

    const result = await sut.execute({
      id: user.id.toString(),
      name: 'John Doe 2',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      data: expect.objectContaining({
        name: 'John Doe 2',
      }),
    })
  })
})
