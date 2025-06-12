import { DomainEvent } from '@/core/events/domain-event'
import { User } from '../entities/user'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'

export class UserCreatedEvent implements DomainEvent {
  public occurredAt: Date
  public user: User
  public actorId: string

  constructor(user: User, actorId: string) {
    this.user = user
    this.actorId = actorId
    this.occurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.user.id
  }
}
