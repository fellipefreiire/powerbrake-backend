import type { Avatar } from '../../enterprise/entities/avatar'

export abstract class AvatarRepository {
  abstract findById(id: string): Promise<Avatar | null>
  abstract create(avatar: Avatar): Promise<void>
  abstract delete(id: string): Promise<void>
}
