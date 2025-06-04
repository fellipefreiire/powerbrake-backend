import { Module } from '@nestjs/common'
import { CaslAbilityModule } from '@/infra/auth/casl/casl-ability.module'
import { StorageModule } from '@/infra/storage/storage.module'
import { UploadAndCreateAvatarUseCase } from '@/shared/avatar/application/use-cases/upload-and-create-avatar'
import { UploadUserAvatarController } from './upload-avatar.controller'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { AvatarDatabaseModule } from '@/infra/database/prisma/repositories/avatar/avatar-database.module'

@Module({
  imports: [
    UserDatabaseModule,
    AvatarDatabaseModule,
    CaslAbilityModule,
    StorageModule,
  ],
  controllers: [UploadUserAvatarController],
  providers: [UploadAndCreateAvatarUseCase],
})
export class AvatarControllersModule {}
