import type { UserAvatar } from '../../enterprise/entities/user-avatar'

export abstract class UserAvatarRepository {
  abstract create(userAvatar: UserAvatar): Promise<void>
  abstract findByUserId(userId: string): Promise<UserAvatar | null>
  abstract delete(userAvatar: UserAvatar): Promise<void>
}
