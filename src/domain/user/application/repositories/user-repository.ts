import { PaginationParams } from '@/core/repositories/pagination-params'
import { User } from '../../enterprise/entities/user'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'

export abstract class UsersRepository {
  abstract findById(id: string): Promise<User | null>
  abstract findManyByIds(ids: string[]): Promise<User[]>
  abstract findByEmail(email: string): Promise<User | null>
  abstract list(params: PaginationParams): Promise<[User[], number]>
  abstract save(user: User): Promise<void>
  abstract create(user: User): Promise<void>
  abstract delete(user: User): Promise<void>
  abstract dispatchEvent(userId: UniqueEntityID): Promise<void>
}
