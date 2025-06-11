import { AuditLog } from '../../enterprise/entities/audit-log'

export abstract class AuditLogRepository {
  abstract create(auditLog: AuditLog): Promise<void>
}
