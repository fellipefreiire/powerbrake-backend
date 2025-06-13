import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { EditUserRoleUseCase } from '../edit-user-role'
import { makeUser } from 'test/factories/make-user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let inMemoryUsersRepository: InMemoryUsersRepository

let sut: EditUserRoleUseCase

describe('Edit User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()

    sut = new EditUserRoleUseCase(inMemoryUsersRepository)
  })

  it('should be able to edit a user', async () => {
    const adminUser = makeUser({ role: 'ADMIN' })
    const user = makeUser(
      {
        email: 'johndoe@example.com',
      },
      new UniqueEntityID('user-1'),
    )

    await inMemoryUsersRepository.create(user)

    const result = await sut.execute({
      id: user.id.toString(),
      role: 'SUPERVISOR',
      actorId: adminUser.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      data: expect.objectContaining({
        role: 'SUPERVISOR',
      }),
    })
  })
})
