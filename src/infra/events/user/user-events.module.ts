import { Module } from '@nestjs/common'
import { OnUserPasswordChanged } from '@/domain/audit-log/application/subscribers/user/on-user-password-changed'
import { CreateAuditLogUseCase } from '@/domain/audit-log/application/use-cases/create-audit-log'
import { AuditLogDatabaseModule } from '@/infra/database/prisma/repositories/audit-log/audit-log-database.module'
import { OnUserCreated } from '@/domain/audit-log/application/subscribers/user/on-user-created'
import { OnUserUpdated } from '@/domain/audit-log/application/subscribers/user/on-user-updated'
import { OnUserRoleChanged } from '@/domain/audit-log/application/subscribers/user/on-user-role-changed'
import { OnUserActiveStatusChanged } from '@/domain/audit-log/application/subscribers/user/on-user-active-status-changed'
import { OnUserLoggedIn } from '@/domain/audit-log/application/subscribers/user/on-user-logged-in'
import { OnUserLoggedOut } from '@/domain/audit-log/application/subscribers/user/on-user-logged-out'
import { OnUserRequestedPasswordReset } from '@/domain/audit-log/application/subscribers/user/on-user-requested-password-reset'
import { OnUserResetPassword } from '@/domain/audit-log/application/subscribers/user/on-user-reset-password'

@Module({
  imports: [AuditLogDatabaseModule],
  providers: [
    OnUserCreated,
    OnUserUpdated,
    OnUserPasswordChanged,
    OnUserRoleChanged,
    OnUserActiveStatusChanged,
    OnUserLoggedIn,
    OnUserLoggedOut,
    OnUserRequestedPasswordReset,
    OnUserResetPassword,
    CreateAuditLogUseCase,
  ],
})
export class UserEventsModule {}
