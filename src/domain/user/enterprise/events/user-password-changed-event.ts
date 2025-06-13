import { DomainEvent } from '@/core/events/domain-event'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { User } from '../entities/user'

export class UserPasswordChangedEvent implements DomainEvent {
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
