import { Injectable } from '@nestjs/common'
import { UserAvatarRepository } from '@/domain/user/application/repositories/user-avatar-repository'
import { UserAvatar } from '@/domain/user/enterprise/entities/user-avatar'
import { PrismaService } from '../../prisma.service'
import { PrismaUserAvatarMapper } from '../../mappers/user/prisma-user-avatar.mapper'

@Injectable()
export class PrismaUserAvatarRepository implements UserAvatarRepository {
  constructor(private prisma: PrismaService) {}

  async create(userAvatar: UserAvatar) {
    const data = PrismaUserAvatarMapper.toPrisma(userAvatar)

    await this.prisma.user.update(data)
  }

  async findByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!user || !user.avatarId) {
      return null
    }

    return PrismaUserAvatarMapper.toDomain(user)
  }

  async delete(userAvatar: UserAvatar) {
    await this.prisma.user.update({
      where: { id: userAvatar.userId.toString() },
      data: {
        avatarId: null,
      },
    })
  }
}
