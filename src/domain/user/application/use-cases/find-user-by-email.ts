import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/user-repository'
import { left, right, type Either } from '@/core/either'
import { User } from '../../enterprise/entities/user'
import { UserNotFoundError } from './errors/user-not-found'

type FindUserByEmailUseCaseRequest = {
  email: string
}

type FindUserByEmailUseCaseResponse = Either<
  UserNotFoundError,
  {
    data: User
  }
>

@Injectable()
export class FindUserByEmailUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    email,
  }: FindUserByEmailUseCaseRequest): Promise<FindUserByEmailUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      return left(new UserNotFoundError())
    }

    return right({
      data: user,
    })
  }
}
