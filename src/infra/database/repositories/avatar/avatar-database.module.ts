import { Module } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AvatarRepository } from '@/shared/avatar/application/repositories/avatar-repository'
import { PrismaAvatarRepository } from './prisma-avatar-repository'

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
