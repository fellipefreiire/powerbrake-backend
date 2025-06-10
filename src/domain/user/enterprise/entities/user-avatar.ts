import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface UserAvatarProps {
  userId: UniqueEntityID
  avatarId: UniqueEntityID
}

export class UserAvatar extends Entity<UserAvatarProps> {
  get userId() {
    return this.props.userId
  }

  get avatarId() {
    return this.props.avatarId
  }

  static create(props: UserAvatarProps, id?: UniqueEntityID) {
    const userAvatar = new UserAvatar(props, id)

    return userAvatar
  }
}
