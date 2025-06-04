import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UserAvatar } from '@/domain/user/enterprise/entities/user-avatar'
import { Prisma, type User } from '@prisma/client'

export class PrismaUserAvatarMapper {
  static toDomain(raw: User): UserAvatar {
    if (!raw.avatarId) {
      throw new Error('User has no avatar.')
    }

    return UserAvatar.create(
      {
        userId: new UniqueEntityID(raw.id),
        avatarId: new UniqueEntityID(raw.avatarId),
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(userAvatar: UserAvatar): Prisma.UserUpdateArgs {
    return {
      where: {
        id: userAvatar.userId.toString(),
      },
      data: {
        avatarId: userAvatar.avatarId.toString(),
      },
    }
  }
}
