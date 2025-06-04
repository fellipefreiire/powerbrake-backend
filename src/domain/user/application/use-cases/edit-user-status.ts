import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/user-repository'
import { left, right, type Either } from '@/core/either'
import { UserNotFoundError } from './errors/user-not-found'
import { User } from '../../enterprise/entities/user'

type EditUserStatusUseCaseRequest = {
  id: string
}

type EditUserStatusUseCaseResponse = Either<
  UserNotFoundError,
  {
    data: User
  }
>

@Injectable()
export class EditUserStatusUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    id,
  }: EditUserStatusUseCaseRequest): Promise<EditUserStatusUseCaseResponse> {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      return left(new UserNotFoundError())
    }

    user.toggleActive()

    await this.usersRepository.save(user)

    return right({
      data: user,
    })
  }
}
