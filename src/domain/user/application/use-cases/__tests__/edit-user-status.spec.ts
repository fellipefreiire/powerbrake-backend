import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { EditUserStatusUseCase } from '../edit-user-status'
import { makeUser } from 'test/factories/make-user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let inMemoryUsersRepository: InMemoryUsersRepository

let sut: EditUserStatusUseCase

describe('Activate User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()

    sut = new EditUserStatusUseCase(inMemoryUsersRepository)
  })

  it('should be able to activate a user', async () => {
    const adminUser = makeUser({ role: 'ADMIN' })
    const user = makeUser(
      {
        email: 'johndoe@example.com',
        isActive: true,
      },
      new UniqueEntityID('user-1'),
    )

    const isActive = !user.isActive

    await inMemoryUsersRepository.create(user)

    const result = await sut.execute({
      id: user.id.toString(),
      actorId: adminUser.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      data: expect.objectContaining({
        isActive,
      }),
    })
  })
})
