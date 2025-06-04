import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/user-repository'
import { left, right, type Either } from '@/core/either'
import { UserNotFoundError } from './errors/user-not-found'
import { User } from '../../enterprise/entities/user'

type EditUserUseCaseRequest = {
  id: string
  name: string
  avatarId?: string
}

type EditUserUseCaseResponse = Either<
  UserNotFoundError,
  {
    data: User
  }
>

@Injectable()
export class EditUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    id,
    name,
  }: EditUserUseCaseRequest): Promise<EditUserUseCaseResponse> {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      return left(new UserNotFoundError())
    }

    user.updateName(name)

    await this.usersRepository.save(user)

    return right({
      data: user,
    })
  }
}
