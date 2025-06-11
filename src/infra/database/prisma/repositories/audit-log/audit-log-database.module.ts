import { Module } from '@nestjs/common'
import { PrismaAuditLogRepository } from './prisma-audit-log.repository'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { AuditLogRepository } from '@/domain/audit-log/application/repositories/audit-log-repository'

@Module({
  providers: [
    PrismaService,
    {
      provide: AuditLogRepository,
      useClass: PrismaAuditLogRepository,
    },
  ],
  exports: [PrismaService, AuditLogRepository],
})
export class AuditLogDatabaseModule {}
