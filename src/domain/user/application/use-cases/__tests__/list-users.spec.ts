import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { makeUser } from 'test/factories/make-user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ListUsersUseCase } from '../list-users'

let inMemoryUsersRepository: InMemoryUsersRepository

let sut: ListUsersUseCase

describe('List User By Id', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()

    sut = new ListUsersUseCase(inMemoryUsersRepository)
  })

  it('should be able to list a user by id', async () => {
    for (let i = 0; i < 22; i++) {
      const user = makeUser({}, new UniqueEntityID(`user-${i}`))
      await inMemoryUsersRepository.create(user)
    }
    const result = await sut.execute({ page: 2 })

    expect(result.isRight()).toBe(true)
    expect(result.value?.data).toHaveLength(2)
  })
})
