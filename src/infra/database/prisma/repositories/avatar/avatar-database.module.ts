import { Module } from '@nestjs/common'
import { AvatarRepository } from '@/shared/avatar/application/repositories/avatar-repository'
import { PrismaAvatarRepository } from './prisma-avatar-repository'
import { PrismaService } from '../../prisma.service'

@Module({
  providers: [
    PrismaService,
    {
      provide: AvatarRepository,
      useClass: PrismaAvatarRepository,
    },
  ],
  exports: [PrismaService, AvatarRepository],
})
export class AvatarDatabaseModule {}
