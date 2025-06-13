import { Module } from '@nestjs/common'
import { OnUserPasswordChanged } from '@/domain/audit-log/application/subscribers/user/on-user-password-changed'
import { CreateAuditLogUseCase } from '@/domain/audit-log/application/use-cases/create-audit-log'
import { AuditLogDatabaseModule } from '@/infra/database/prisma/repositories/audit-log/audit-log-database.module'
import { OnUserCreated } from '@/domain/audit-log/application/subscribers/user/on-user-created'
import { OnUserUpdated } from '@/domain/audit-log/application/subscribers/user/on-user-updated'

@Module({
  imports: [AuditLogDatabaseModule],
  providers: [
    OnUserCreated,
    OnUserUpdated,
    OnUserPasswordChanged,
    CreateAuditLogUseCase,
  ],
})
export class UserEventsModule {}
