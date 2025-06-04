import { AggregateRoot } from '@/core/entities/aggregate-root'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'
import type { Role } from '@prisma/client'

export interface UserProps {
  name: string
  email: string
  passwordHash: string
  role: Role
  isActive: boolean
  avatarId?: UniqueEntityID | null
  createdAt: Date
  updatedAt?: Date
}

export class User extends AggregateRoot<UserProps> {
  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get passwordHash() {
    return this.props.passwordHash
  }

  get role() {
    return this.props.role
  }

  get isActive() {
    return this.props.isActive
  }

  get avatarId() {
    return this.props.avatarId
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  updateName(value: string) {
    this.props.name = value
    this.touch()
  }

  updateRole(value: Role) {
    this.props.role = value
    this.touch()
  }

  toggleActive() {
    this.props.isActive = !this.props.isActive
    this.touch()
  }

  updateAvatar(value: UniqueEntityID | undefined | null) {
    this.props.avatarId = value
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(props: Optional<UserProps, 'createdAt'>, id?: UniqueEntityID) {
    const now = new Date()
    const user = new User(
      {
        ...props,
        role: props.role ?? 'OPERATOR',
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? now,
        updatedAt: props.updatedAt ?? now,
      },
      id,
    )
    return user
  }
}
