import { DomainEvent } from '@/core/events/domain-event'
import { User } from '../entities/user'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'

export class UserActiveStatusChangedEvent implements DomainEvent {
  public occurredAt: Date
  public user: User
  public previousIsActive: boolean
  public actorId: string

  constructor(user: User, actorId: string, previousIsActive: boolean) {
    this.user = user
    this.previousIsActive = previousIsActive
    this.actorId = actorId
    this.occurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.user.id
  }
}
