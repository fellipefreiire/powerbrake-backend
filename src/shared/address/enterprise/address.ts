import { Entity } from '@/core/entities/entity'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

export interface AddressProps {
  street: string
  number: string
  complement?: string | null
  neighborhood: string
  city: string
  state: string
  zipCode: string
  createdAt: Date
  updatedAt?: Date
  userId?: UniqueEntityID
  clientId?: UniqueEntityID
}

export class Address extends Entity<AddressProps> {
  get street() {
    return this.props.street
  }

  get number() {
    return this.props.number
  }

  get complement() {
    return this.props.complement
  }

  get neighborhood() {
    return this.props.neighborhood
  }

  get city() {
    return this.props.city
  }

  get state() {
    return this.props.state
  }

  get zipCode() {
    return this.props.zipCode
  }

  get userId() {
    return this.props.userId
  }

  get clientId() {
    return this.props.clientId
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(
    props: Optional<AddressProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const now = new Date()
    return new Address(
      {
        ...props,
        createdAt: props.createdAt ?? now,
        updatedAt: props.updatedAt ?? now,
      },
      id,
    )
  }
}
