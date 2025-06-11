import {
  AuditLogRepository,
  ListAuditLogsFilters,
} from '@/domain/audit-log/application/repositories/audit-log-repository'
import { AuditLog } from '@/domain/audit-log/enterprise/entities/audit-log'
import type { CursorPaginationParams } from '@/core/repositories/pagination-params'
import { UsersRepository } from '@/domain/user/application/repositories/user-repository'
import { ActorType } from '@prisma/client'

export class InMemoryAuditLogRepository implements AuditLogRepository {
  public items: AuditLog[] = []

  constructor(private usersRepository: UsersRepository) {}

  async create(auditLog: AuditLog): Promise<void> {
    this.items.push(auditLog)
  }

  async resolveActorIdByEmail(
    actorType: ActorType,
    email: string,
  ): Promise<string | undefined> {
    if (actorType === ActorType.USER) {
      const user = await this.usersRepository.findByEmail(email)
      return user?.id.toString()
    }

    return undefined
  }

  async findMany(
    {
      actorType,
      actorId,
      entity,
      action,
      entityId,
      startDate,
      endDate,
    }: ListAuditLogsFilters,
    { cursor, limit }: CursorPaginationParams,
  ): Promise<[AuditLog[], boolean]> {
    let results = this.items.filter((item) => {
      return (
        item.actorType === actorType &&
        (!actorId || item.actorId === actorId) &&
        (!entity || item.entity === entity) &&
        (!action || item.action === action) &&
        (!entityId || item.entityId === entityId) &&
        (!startDate || item.createdAt >= startDate) &&
        (!endDate || item.createdAt <= endDate)
      )
    })

    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    if (cursor) {
      const index = results.findIndex((item) => item.id.toString() === cursor)
      if (index >= 0) {
        results = results.slice(index + 1)
      }
    }

    const paginated = results.slice(0, limit)
    const hasNextPage = results.length > limit

    return [paginated, hasNextPage]
  }
}
