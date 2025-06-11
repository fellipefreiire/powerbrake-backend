import { AuditLog } from '@/domain/audit-log/enterprise/entities/audit-log'
import { Prisma } from '@prisma/client'

export class PrismaAuditLogMapper {
  static toPrisma(auditLog: AuditLog): Prisma.AuditLogCreateInput {
    return {
      id: auditLog.id.toString(),
      actorId: auditLog.actorId.toString(),
      actorType: auditLog.actorType,
      action: auditLog.action,
      entity: auditLog.entity,
      entityId: auditLog.entityId.toString(),
      changes: auditLog.changes
        ? JSON.stringify(auditLog.changes)
        : Prisma.JsonNull,
      createdAt: auditLog.createdAt,
    }
  }
}
