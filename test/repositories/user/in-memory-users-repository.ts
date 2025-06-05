import type { PaginationParams } from '@/core/repositories/pagination-params'
import type { UsersRepository } from '@/domain/user/application/repositories/user-repository'
import type { User } from '@/domain/user/enterprise/entities/user'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []

  async findById(id: string) {
    const user = this.items.find((item) => item.id.toString() === id)

    return user || null
  }

  async findByEmail(email: string) {
    const user = this.items.find((item) => item.email === email)

    return user || null
  }

  async list({ page = 1, perPage = 20 }: PaginationParams) {
    const total = this.items.length
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage

    const users = this.items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(startIndex, endIndex)

    return [users, total] as [User[], number]
  }

  async create(user: User) {
    this.items.push(user)
  }

  async save(user: User) {
    const itemIndex = this.items.findIndex((item) => item.id === user.id)

    this.items[itemIndex] = user
  }

  async delete(user: User) {
    const itemIndex = this.items.findIndex((item) => item.id === user.id)

    this.items.splice(itemIndex, 1)
  }
}
