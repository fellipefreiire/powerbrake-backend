import { AuditLogRepository } from '@/domain/audit-log/application/repositories/audit-log-repository'
import { AuditLog } from '@/domain/audit-log/enterprise/entities/audit-log'

export class InMemoryAuditLogRepository implements AuditLogRepository {
  public items: AuditLog[] = []

  async create(auditLog: AuditLog): Promise<void> {
    this.items.push(auditLog)
  }
}
