import { Module } from '@nestjs/common'
import { UsersRepository } from '@/domain/user/application/repositories/user-repository'
import { CacheModule } from '@/infra/cache/cache.module'
import { PrismaService } from '../../prisma/prisma.service'
import { PrismaUsersRepository } from './prisma-users-repository'
import { UserAvatarRepository } from '@/domain/user/application/repositories/user-avatar-repository'
import { PrismaUserAvatarRepository } from './prisma-user-avatar-repository'
import { UserFactory } from 'test/factories/make-user'

@Module({
  imports: [CacheModule],
  providers: [
    PrismaService,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
    {
      provide: UserAvatarRepository,
      useClass: PrismaUserAvatarRepository,
    },
    UserFactory,
  ],
  exports: [PrismaService, UsersRepository, UserAvatarRepository, UserFactory],
})
export class UserDatabaseModule {}
