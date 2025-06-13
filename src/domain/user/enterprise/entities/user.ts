import { AggregateRoot } from '@/core/entities/aggregate-root'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'
import type { Role } from '@prisma/client'
import { UserAddressList } from './user-address-list'
import { UserPasswordChangedEvent } from '../events/user-password-changed-event'
import { UserCreatedEvent } from '../events/user-created-event'
import { UserUpdatedEvent } from '../events/user-updated-event'

export interface UserProps {
  name: string
  email: string
  passwordHash: string
  role: Role
  isActive: boolean
  avatarId?: UniqueEntityID | null
  addresses: UserAddressList
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

  get addresses() {
    return this.props.addresses
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  updateRole(value: Role) {
    this.props.role = value
    this.touch()
  }

  toggleActive() {
    this.props.isActive = !this.props.isActive
    this.touch()
  }

  updateAddress(addresses: UserAddressList) {
    this.props.addresses = addresses
    this.touch()
  }

  updatePassword(hash: string) {
    this.addDomainEvent(new UserPasswordChangedEvent(this))

    this.props.passwordHash = hash
    this.touch()
  }

  update({
    name,
    avatarId,
    addresses,
  }: {
    name: string
    avatarId: UniqueEntityID | null
    addresses: UserAddressList
  }) {
    let updated = false
    const previousData = {
      name: this.props.name,
      avatarId: this.props.avatarId,
      addresses: this.props.addresses,
    }

    if (this.props.name !== name) {
      this.props.name = name
      updated = true
    }

    if (this.props.avatarId?.toString() !== avatarId?.toString()) {
      this.props.avatarId = avatarId
      updated = true
    }

    if (!this.props.addresses.equals(addresses)) {
      this.props.addresses = addresses
      updated = true
    }

    if (updated) {
      this.touch()
      this.addDomainEvent(new UserUpdatedEvent(this, previousData))
    }
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<UserProps, 'createdAt' | 'addresses'>,
    id?: UniqueEntityID,
    actorId?: UniqueEntityID,
  ) {
    const now = new Date()
    const user = new User(
      {
        ...props,
        role: props.role ?? 'OPERATOR',
        addresses: props.addresses ?? new UserAddressList(),
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? now,
        updatedAt: props.updatedAt ?? now,
      },
      id,
    )

    const isNewUser = !id

    if (isNewUser && actorId) {
      user.addDomainEvent(new UserCreatedEvent(user, actorId.toString()))
    }

    return user
  }
}
