import { UserAvatar } from '@/domain/user/enterprise/entities/user-avatar'
import { UserAvatarRepository } from '@/domain/user/application/repositories/user-avatar-repository'

export class InMemoryUserAvatarRepository implements UserAvatarRepository {
  public items: UserAvatar[] = []

  async create(userAvatar: UserAvatar): Promise<void> {
    const existingIndex = this.items.findIndex((item) =>
      item.userId.equals(userAvatar.userId),
    )

    if (existingIndex >= 0) {
      this.items[existingIndex] = userAvatar
    } else {
      this.items.push(userAvatar)
    }
  }

  async findByUserId(userId: string): Promise<UserAvatar | null> {
    const found = this.items.find((item) => item.userId.toString() === userId)
    return found ?? null
  }

  async delete(userAvatar: UserAvatar): Promise<void> {
    const index = this.items.findIndex(
      (item) =>
        item.userId.equals(userAvatar.userId) &&
        item.avatarId.equals(userAvatar.avatarId),
    )

    if (index !== -1) {
      this.items.splice(index, 1)
    }
  }
}
