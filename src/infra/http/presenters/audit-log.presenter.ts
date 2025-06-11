import { AuditLog } from '@/domain/audit-log/enterprise/entities/audit-log'
import { ActorType } from '@prisma/client'

type AuditLogWithActorInfo = AuditLog & {
  actorName: string
  actorEmail: string
}

export class AuditLogPresenter {
  static toHTTP(auditLog: AuditLogWithActorInfo) {
    return {
      id: auditLog.id.toString(),
      actor: {
        id: auditLog.actorId,
        type: auditLog.actorType as ActorType,
        name: auditLog.actorName,
        email: auditLog.actorEmail,
      },
      action: auditLog.action,
      entity: auditLog.entity,
      entityId: auditLog.entityId,
      changes: auditLog.changes ?? null,
      createdAt: auditLog.createdAt,
    }
  }
}
