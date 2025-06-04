import { Module } from '@nestjs/common'
import { CreateUserController } from './create-user.controller'
import { CreateUserUseCase } from '@/domain/user/application/use-cases/create-user'
import { FindUserByIdController } from './find-user-by-id.controller'
import { FindUserByIdUseCase } from '@/domain/user/application/use-cases/find-user-by-id'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { AuthenticateUserController } from './authenticate-user.controller'
import { AuthenticateUserUseCase } from '@/domain/user/application/use-cases/authenticate-user'
import { CaslAbilityModule } from '@/infra/auth/casl/casl-ability.module'
import { EditUserController } from './edit-user.controller'
import { EditUserUseCase } from '@/domain/user/application/use-cases/edit-user'
import { EditUserStatusController } from './edit-user-status.controller'
import { EditUserStatusUseCase } from '@/domain/user/application/use-cases/edit-user-status'
import { EditUserRoleController } from './edit-user-role.controller'
import { EditUserRoleUseCase } from '@/domain/user/application/use-cases/edit-user-role'
import { ListUsersController } from './list-users.controller'
import { ListUsersUseCase } from '@/domain/user/application/use-cases/list-users'
import { StorageModule } from '@/infra/storage/storage.module'
import { UserDatabaseModule } from '@/infra/database/repositories/user/user-database.module'

@Module({
  imports: [
    UserDatabaseModule,
    CryptographyModule,
    CaslAbilityModule,
    StorageModule,
  ],
  controllers: [
    AuthenticateUserController,
    CreateUserController,
    EditUserRoleController,
    EditUserStatusController,
    EditUserController,
    FindUserByIdController,
    ListUsersController,
  ],
  providers: [
    AuthenticateUserUseCase,
    CreateUserUseCase,
    EditUserRoleUseCase,
    EditUserStatusUseCase,
    EditUserUseCase,
    FindUserByIdUseCase,
    ListUsersUseCase,
  ],
})
export class UserControllersModule {}
