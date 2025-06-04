import { Injectable } from '@nestjs/common'
import { Avatar } from '@/shared/avatar/enterprise/entities/avatar'
import { AvatarRepository } from '@/shared/avatar/application/repositories/avatar-repository'
import { PrismaService } from '../../prisma.service'
import { PrismaAvatarMapper } from '../../mappers/avatar/prisma-avatar.mapper'

@Injectable()
export class PrismaAvatarRepository implements AvatarRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const data = await this.prisma.avatar.findUnique({
      where: { id },
    })

    if (!data) {
      return null
    }

    return PrismaAvatarMapper.toDomain(data)
  }

  async create(avatar: Avatar) {
    const data = PrismaAvatarMapper.toPrisma(avatar)

    await this.prisma.avatar.create({
      data,
    })
  }

  async delete(id: string) {
    await this.prisma.avatar.delete({
      where: {
        id,
      },
    })
  }
}
