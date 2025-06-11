import { Module } from '@nestjs/common'
import { CaslAbilityModule } from '@/infra/auth/casl/casl-ability.module'
import { StorageModule } from '@/infra/storage/storage.module'
import { UserDatabaseModule } from '@/infra/database/prisma/repositories/user/user-database.module'
import { ListAuditLogsController } from './list-audit-logs.controller'
import { ListAuditLogsUseCase } from '@/domain/audit-log/application/use-cases/list-audit-logs'
import { AuditLogDatabaseModule } from '@/infra/database/prisma/repositories/audit-log/audit-log-database.module'

@Module({
  imports: [
    AuditLogDatabaseModule,
    UserDatabaseModule,
    CaslAbilityModule,
    StorageModule,
  ],
  controllers: [ListAuditLogsController],
  providers: [ListAuditLogsUseCase],
})
export class AuditLogControllersModule {}
