import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { makeUser } from 'test/factories/make-user'
import { ForgotPasswordUseCase } from '../forgot-password'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { FakeMailer } from 'test/cryptography/fake-mailer'

let usersRepository: InMemoryUsersRepository
let encrypter: FakeEncrypter
let mailer: FakeMailer
let sut: ForgotPasswordUseCase

const fakeEmail = 'user@example.com'
const fakeUserId = 'user-123'
const fakeToken = 'fake-token'
const resetPasswordUrl = 'https://example.com/reset-password'

describe('ForgotPasswordUseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    encrypter = new FakeEncrypter()
    mailer = new FakeMailer()

    sut = new ForgotPasswordUseCase(usersRepository, encrypter, mailer)
  })

  it('should send reset email if user exists', async () => {
    const user = makeUser({ email: fakeEmail }, new UniqueEntityID(fakeUserId))
    await usersRepository.create(user)

    const result = await sut.execute({
      email: fakeEmail,
      resetPasswordUrl,
    })

    expect(result.isRight()).toBe(true)
    expect(mailer.sent).toHaveLength(1)
    expect(mailer.sent[0]).toEqual(
      expect.objectContaining({
        to: fakeEmail,
        subject: expect.any(String),
        html: expect.stringContaining(`${resetPasswordUrl}?token=${fakeToken}`),
      }),
    )
  })

  it('should do nothing if user does not exist', async () => {
    const result = await sut.execute({
      email: fakeEmail,
      resetPasswordUrl,
    })

    expect(result.isRight()).toBe(true)
    expect(mailer.sent).toHaveLength(0)
  })
})
