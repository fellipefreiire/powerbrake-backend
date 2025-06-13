import { DomainEvent } from '@/core/events/domain-event'
import type { User } from '../entities/user'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { UserAddressList } from '../entities/user-address-list'

type PreviousData = {
  name: string
  avatarId: UniqueEntityID | null | undefined
  addresses: UserAddressList
}

export class UserUpdatedEvent implements DomainEvent {
  public occurredAt: Date
  public user: User
  public previousData: PreviousData

  constructor(user: User, previousData: PreviousData) {
    this.user = user
    this.previousData = previousData
    this.occurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.user.id
  }
}
