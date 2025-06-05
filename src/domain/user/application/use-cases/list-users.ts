import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/user-repository'
import { right, type Either } from '@/core/either'
import { User } from '../../enterprise/entities/user'
import type { PaginationMeta } from '@/core/repositories/pagination-params'

type ListUserUseCaseRequest = {
  page?: number
  perPage?: number
}

type ListUserUseCaseResponse = Either<
  null,
  {
    data: User[]
    meta: PaginationMeta
  }
>

@Injectable()
export class ListUsersUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    page = 1,
    perPage = 20,
  }: ListUserUseCaseRequest): Promise<ListUserUseCaseResponse> {
    const [users, total] = await this.usersRepository.list({
      page,
      perPage,
    })

    const totalPages = Math.ceil(total / perPage)

    return right({
      data: users,
      meta: {
        total,
        count: users.length,
        perPage,
        totalPages,
        currentPage: page,
        nextPage: page < totalPages ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
      },
    })
  }
}
