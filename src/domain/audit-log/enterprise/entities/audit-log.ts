import { Entity } from '@/core/entities/entity'
import { Optional } from '@/core/types/optional'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export type ActorType = 'USER' | 'CLIENT'

export interface AuditLogProps {
  actorId: string
  actorType: ActorType
  action: string
  entity: string
  entityId: string
  changes?: Record<string, unknown> | null
  createdAt: Date
}

export class AuditLog extends Entity<AuditLogProps> {
  get actorId() {
    return this.props.actorId
  }

  get actorType() {
    return this.props.actorType
  }

  get action() {
    return this.props.action
  }

  get entity() {
    return this.props.entity
  }

  get entityId() {
    return this.props.entityId
  }

  get changes() {
    return this.props.changes
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<AuditLogProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    return new AuditLog(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
