import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Avatar } from '@/shared/avatar/enterprise/entities/avatar'
import { Avatar as PrismaAvatar, Prisma } from '@prisma/client'

export class PrismaAvatarMapper {
  static toDomain(raw: PrismaAvatar): Avatar {
    return Avatar.create(
      {
        title: raw.title,
        url: raw.url,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(avatar: Avatar): Prisma.AvatarCreateInput {
    return {
      id: avatar.id.toString(),
      title: avatar.title,
      url: avatar.url,
    }
  }
}
