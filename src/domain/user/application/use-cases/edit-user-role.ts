import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/user-repository'
import { left, right, type Either } from '@/core/either'
import { UserNotFoundError } from './errors/user-not-found'
import { User } from '../../enterprise/entities/user'
import type { Role } from '@prisma/client'

type EditUserRoleUseCaseRequest = {
  id: string
  role: Role
}

type EditUserRoleUseCaseResponse = Either<
  UserNotFoundError,
  {
    data: User
  }
>

@Injectable()
export class EditUserRoleUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    id,
    role,
  }: EditUserRoleUseCaseRequest): Promise<EditUserRoleUseCaseResponse> {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      return left(new UserNotFoundError())
    }

    user.updateRole(role)

    await this.usersRepository.save(user)

    return right({
      data: user,
    })
  }
}
