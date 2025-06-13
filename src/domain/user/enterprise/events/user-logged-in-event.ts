import { DomainEvent } from '@/core/events/domain-event'
import { User } from '../entities/user'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'

export class UserLoggedInEvent implements DomainEvent {
  public occurredAt: Date
  public user: User

  constructor(user: User) {
    this.user = user
    this.occurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.user.id
  }
}
