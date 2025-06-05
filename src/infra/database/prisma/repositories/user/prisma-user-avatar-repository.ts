import { Injectable } from '@nestjs/common'
import { UserAvatarRepository } from '@/domain/user/application/repositories/user-avatar-repository'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class PrismaUserAvatarRepository implements UserAvatarRepository {
  constructor(private prisma: PrismaService) {}

  async attachAvatarToUser(userId: string, avatarId: string): Promise<void> {
    await this.prisma.avatar.update({
      where: { id: avatarId },
      data: { userId },
    })
  }
}
