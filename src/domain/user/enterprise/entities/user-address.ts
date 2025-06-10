import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface UserAddressProps {
  userId: UniqueEntityID
  addressId: UniqueEntityID
}

export class UserAddress extends Entity<UserAddressProps> {
  get userId() {
    return this.props.userId
  }

  get addressId() {
    return this.props.addressId
  }

  static create(props: UserAddressProps, id?: UniqueEntityID) {
    const userAddress = new UserAddress(props, id)

    return userAddress
  }
}
