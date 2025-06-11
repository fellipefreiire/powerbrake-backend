import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { AuditLog } from '@/domain/audit-log/enterprise/entities/audit-log'
import { Prisma, AuditLog as PrismaAuditLog } from '@prisma/client'

export class PrismaAuditLogMapper {
  static toDomain(raw: PrismaAuditLog): AuditLog {
    return AuditLog.create(
      {
        actorId: raw.actorId,
        actorType: raw.actorType,
        action: raw.action,
        entity: raw.entity,
        entityId: raw.entityId,
        changes: raw.changes
          ? typeof raw.changes === 'object'
            ? raw.changes
            : JSON.parse(raw.changes as string)
          : null,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

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
