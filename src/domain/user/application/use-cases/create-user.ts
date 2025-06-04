import { left, right, type Either } from '@/core/either'
import { UsersRepository } from '@/domain/user/application/repositories/user-repository'
import { User } from '@/domain/user/enterprise/entities/user'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import { Injectable } from '@nestjs/common'
import { HashGenerator } from '../../../../shared/cryptography/hash-generator'
import type { Role } from '@prisma/client'

interface CreateUserUseCaseRequest {
  name: string
  email: string
  password: string
  role: Role
}

type CreateUserUseCaseResponse = Either<
  UserAlreadyExistsError,
  {
    data: User
  }
>

@Injectable()
export class CreateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    name,
    email,
    password,
    role,
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    const userAlreadyExists = await this.usersRepository.findByEmail(email)

    if (userAlreadyExists) {
      return left(new UserAlreadyExistsError(email))
    }

    const passwordHash = await this.hashGenerator.hash(password)

    const user = User.create({
      email,
      isActive: true,
      name,
      passwordHash,
      role,
    })

    await this.usersRepository.create(user)

    return right({
      data: user,
    })
  }
}
