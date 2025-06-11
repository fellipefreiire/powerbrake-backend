import { describe, beforeEach, it, expect, vi } from 'vitest'
import { AuthenticateUserUseCase } from '@/domain/user/application/use-cases/authenticate-user'
import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { makeUser } from 'test/factories/make-user'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { TokenService } from '@/infra/auth/token.service'
import { RefreshTokenService } from '@/infra/auth/refresh-token.service'
import { Role } from '@prisma/client'

let sut: AuthenticateUserUseCase
let usersRepository: InMemoryUsersRepository
let hasher: FakeHasher
let tokenService: TokenService
let refreshTokenService: RefreshTokenService

describe('Authenticate User', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    hasher = new FakeHasher()

    tokenService = {
      generateAccessToken: vi.fn().mockResolvedValue({
        token: 'access-token',
        expiresIn: 9999,
      }),
      generateRefreshToken: vi.fn().mockResolvedValue({
        token: 'refresh-token',
        expiresIn: 999999,
      }),
    } as unknown as TokenService

    refreshTokenService = {
      create: vi.fn().mockResolvedValue('fake-jti'),
      validate: vi.fn(),
      revoke: vi.fn(),
    } as unknown as RefreshTokenService

    sut = new AuthenticateUserUseCase(
      usersRepository,
      hasher,
      tokenService,
      refreshTokenService,
    )
  })

  it('should be able to authenticate a user and return tokens', async () => {
    const user = makeUser({
      email: 'johndoe@example.com',
      passwordHash: await hasher.hash('123456'),
      role: 'OPERATOR' as Role,
    })

    await usersRepository.create(user)

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      accessToken: {
        token: 'access-token',
        expiresIn: 9999,
      },
      refreshToken: {
        token: 'refresh-token',
        expiresIn: 999999,
      },
      expiresIn: 9999,
    })
  })
})
