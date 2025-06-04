import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/user-repository'
import { right, type Either } from '@/core/either'
import { User } from '../../enterprise/entities/user'

type ListUserUseCaseRequest = {
  page: number
}

type ListUserUseCaseResponse = Either<
  null,
  {
    data: User[]
  }
>

@Injectable()
export class ListUsersUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    page,
  }: ListUserUseCaseRequest): Promise<ListUserUseCaseResponse> {
    const users = await this.usersRepository.list({ page })

    return right({
      data: users,
    })
  }
}
