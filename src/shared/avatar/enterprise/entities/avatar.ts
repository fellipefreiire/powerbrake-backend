import { Entity } from '@/core/entities/entity'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface AvatarProps {
  title: string
  url: string
}

export class Avatar extends Entity<AvatarProps> {
  get title() {
    return this.props.title
  }

  get url() {
    return this.props.url
  }

  static create(props: AvatarProps, id?: UniqueEntityID) {
    const avatar = new Avatar(props, id)

    return avatar
  }
}
