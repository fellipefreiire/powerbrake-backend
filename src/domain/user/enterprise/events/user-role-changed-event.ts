import { DomainEvent } from '@/core/events/domain-event'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { User } from '../entities/user'

export class UserRoleChangedEvent implements DomainEvent {
  public occurredAt: Date
  public user: User
  public actorId: string
  public previousRole: string

  constructor(user: User, actorId: string, previousRole: string) {
    this.occurredAt = new Date()
    this.user = user
    this.actorId = actorId
    this.previousRole = previousRole
  }

  getAggregateId(): UniqueEntityID {
    return this.user.id
  }
}
