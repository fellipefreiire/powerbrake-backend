import { Module } from '@nestjs/common'
import { UsersRepository } from '@/domain/user/application/repositories/user-repository'
import { CacheModule } from '@/infra/cache/cache.module'
import { PrismaUsersRepository } from './prisma-users-repository'
import { UserAvatarRepository } from '@/domain/user/application/repositories/user-avatar-repository'
import { PrismaUserAvatarRepository } from './prisma-user-avatar-repository'
import { UserFactory } from 'test/factories/make-user'
import { PrismaService } from '../../prisma.service'
import { UserAddressRepository } from '@/domain/user/application/repositories/user-address-repository'
import { PrismaUserAddressRepository } from './prisma-user-address-repository'

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
    {
      provide: UserAddressRepository,
      useClass: PrismaUserAddressRepository,
    },
    UserFactory,
  ],
  exports: [
    PrismaService,
    UsersRepository,
    UserAvatarRepository,
    UserAddressRepository,
    UserFactory,
  ],
})
export class UserDatabaseModule {}
