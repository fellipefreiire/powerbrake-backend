import { UserAvatar } from '@/domain/user/enterprise/entities/user-avatar'
import { UserAvatarRepository } from '@/domain/user/application/repositories/user-avatar-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export class InMemoryUserAvatarRepository implements UserAvatarRepository {
  public items: UserAvatar[] = []

  async attachAvatarToUser(userId: string, avatarId: string): Promise<void> {
    const relation = UserAvatar.create({
      userId: new UniqueEntityID(userId),
      avatarId: new UniqueEntityID(avatarId),
    })

    const index = this.items.findIndex(
      (item) => item.userId.toString() === userId,
    )

    if (index >= 0) {
      this.items[index] = relation
    } else {
      this.items.push(relation)
    }
  }
}
