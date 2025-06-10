import { AggregateRoot } from '@/core/entities/aggregate-root'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'
import type { Role } from '@prisma/client'
import { UserAddressList } from './user-address-list'

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

  updateAddress(addresses: UserAddressList) {
    this.props.addresses = addresses
    this.touch()
  }

  updatePassword(hash: string) {
    this.props.passwordHash = hash
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<UserProps, 'createdAt' | 'addresses'>,
    id?: UniqueEntityID,
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
    return user
  }
}
