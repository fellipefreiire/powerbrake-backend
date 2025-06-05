import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { makeUser } from 'test/factories/make-user'
import { ListUsersUseCase } from '../list-users'

let inMemoryUsersRepository: InMemoryUsersRepository

let sut: ListUsersUseCase

describe('List Users', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()

    sut = new ListUsersUseCase(inMemoryUsersRepository)
  })

  it('should return paginated users with metadata', async () => {
    for (let i = 1; i <= 35; i++) {
      await inMemoryUsersRepository.create(
        makeUser({
          name: `User ${i}`,
          email: `user${i}@example.com`,
          createdAt: new Date(2024, 0, i),
        }),
      )
    }

    const result = await sut.execute({ page: 2, perPage: 10 })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      const { data: users, meta } = result.value

      expect(users).toHaveLength(10)
      expect(users[0].name).toBe('User 25')
      expect(meta).toEqual({
        total: 35,
        count: 10,
        perPage: 10,
        totalPages: 4,
        currentPage: 2,
        nextPage: 3,
        previousPage: 1,
      })
    }
  })

  it('should return default perPage = 20 when not specified', async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryUsersRepository.create(makeUser({}))
    }

    const result = await sut.execute({ page: 1 })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.data).toHaveLength(20)
      expect(result.value.meta.perPage).toBe(20)
    }
  })

  it('should return nextPage as null on last page', async () => {
    for (let i = 1; i <= 15; i++) {
      await inMemoryUsersRepository.create(makeUser({}))
    }

    const result = await sut.execute({ page: 2, perPage: 10 })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.meta.nextPage).toBe(null)
      expect(result.value.meta.previousPage).toBe(1)
    }
  })
})
