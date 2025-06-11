// src/infra/events/user/user-events.module.ts
import { Module } from '@nestjs/common'
import { OnUserPasswordChanged } from '@/domain/audit-log/application/subscribers/user/on-user-password-changed'
import { CreateAuditLogUseCase } from '@/domain/audit-log/application/use-cases/create-audit-log'
import { AuditLogDatabaseModule } from '@/infra/database/prisma/repositories/audit-log/audit-log-database.module'

@Module({
  imports: [AuditLogDatabaseModule],
  providers: [OnUserPasswordChanged, CreateAuditLogUseCase],
})
export class UserEventsModule {}
