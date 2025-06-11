import { UserPresenter } from '../user.presenter'
import { makeUser } from 'test/factories/make-user'

describe('UserPresenter', () => {
  it('should present a user correctly to HTTP', () => {
    const user = makeUser({
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'ADMIN',
    })

    const result = UserPresenter.toHTTP(user)

    expect(result).toEqual({
      id: user.id.toString(),
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'ADMIN',
      isActive: true,
      addresses: [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  })
})
