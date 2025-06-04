import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/user-repository'
import { left, right, type Either } from '@/core/either'
import { User } from '../../enterprise/entities/user'
import { UserNotFoundError } from './errors/user-not-found'

type FindUserByIdUseCaseRequest = {
  id: string
}

type FindUserByIdUseCaseResponse = Either<
  UserNotFoundError,
  {
    data: User
  }
>

@Injectable()
export class FindUserByIdUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    id,
  }: FindUserByIdUseCaseRequest): Promise<FindUserByIdUseCaseResponse> {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      return left(new UserNotFoundError())
    }

    return right({
      data: user,
    })
  }
}
