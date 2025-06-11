import type { CursorPaginationParams } from '@/core/repositories/pagination-params'
import { AuditLog, type ActorType } from '../../enterprise/entities/audit-log'

export type ListAuditLogsFilters = {
  actorType: ActorType
  actorEmail?: string
  actorId?: string
  entity?: string
  action?: string
  entityId?: string
  startDate?: Date
  endDate?: Date
}

export abstract class AuditLogRepository {
  abstract create(auditLog: AuditLog): Promise<void>
  abstract findMany(
    filters: ListAuditLogsFilters,
    pagination: CursorPaginationParams,
  ): Promise<[AuditLog[], hasNextPage: boolean]>

  abstract resolveActorIdByEmail(
    actorType: ActorType,
    email: string,
  ): Promise<string | undefined>
}
