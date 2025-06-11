import { Injectable } from '@nestjs/common'
import { AuditLogRepository } from '@/domain/audit-log/application/repositories/audit-log-repository'
import { AuditLog } from '@/domain/audit-log/enterprise/entities/audit-log'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { PrismaAuditLogMapper } from '../../mappers/audit-log/prisma-audit-log.mapper'

@Injectable()
export class PrismaAuditLogRepository implements AuditLogRepository {
  constructor(private prisma: PrismaService) {}

  async create(auditLog: AuditLog): Promise<void> {
    const data = PrismaAuditLogMapper.toPrisma(auditLog)

    await this.prisma.auditLog.create({
      data,
    })
  }
}
