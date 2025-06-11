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
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { RefreshTokenController } from './refresh-token.controller'
import { RefreshUserTokenUseCase } from '@/domain/user/application/use-cases/refresh-user-token'
import { AuthModule } from '@/infra/auth/auth.module'
import { LogoutUserController } from './logout-user.controller'
import { LogoutUserUseCase } from '@/domain/user/application/use-cases/logout-user'
import { MailerModule } from '@/infra/mail/mailer.module'
import { ResetPasswordController } from './reset-password.controller'
import { ResetPasswordUseCase } from '@/domain/user/application/use-cases/reset-password'
import { ForgotPasswordController } from './forgot-password.controller'
import { ForgotPasswordUseCase } from '@/domain/user/application/use-cases/forgot-password'
import { EnvModule } from '@/infra/env/env.module'
import { EditUserPasswordController } from './edit-user-password.controller'
import { EditUserPasswordUseCase } from '@/domain/user/application/use-cases/edit-user-password'

@Module({
  imports: [
    UserDatabaseModule,
    CryptographyModule,
    CaslAbilityModule,
    StorageModule,
    AuthModule,
    MailerModule,
    EnvModule,
  ],
  controllers: [
    AuthenticateUserController,
    CreateUserController,
    EditUserRoleController,
    EditUserStatusController,
    EditUserController,
    FindUserByIdController,
    ListUsersController,
    RefreshTokenController,
    LogoutUserController,
    ResetPasswordController,
    ForgotPasswordController,
    EditUserPasswordController,
  ],
  providers: [
    AuthenticateUserUseCase,
    CreateUserUseCase,
    EditUserRoleUseCase,
    EditUserStatusUseCase,
    EditUserUseCase,
    FindUserByIdUseCase,
    ListUsersUseCase,
    RefreshUserTokenUseCase,
    LogoutUserUseCase,
    ResetPasswordUseCase,
    ForgotPasswordUseCase,
    EditUserPasswordUseCase,
  ],
})
export class UserControllersModule {}
