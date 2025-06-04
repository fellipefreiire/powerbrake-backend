import { faker } from '@faker-js/faker'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { PrismaAvatarMapper } from '@/infra/database/prisma/mappers/avatar/prisma-avatar.mapper'
import {
  Avatar,
  type AvatarProps,
} from '@/shared/avatar/enterprise/entities/avatar'

export function makeAvatar(
  override: Partial<AvatarProps> = {},
  id?: UniqueEntityID,
) {
  const avatar = Avatar.create(
    {
      title: faker.lorem.word(),
      url: faker.image.url(),
      ...override,
    },
    id,
  )

  return avatar
}

@Injectable()
export class AvatarFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaAvatar(data: Partial<AvatarProps> = {}): Promise<Avatar> {
    const avatar = makeAvatar(data)

    await this.prisma.avatar.create({
      data: PrismaAvatarMapper.toPrisma(avatar),
    })

    return avatar
  }
}
