import { Injectable } from '@nestjs/common'
import {
  AuditLogRepository,
  ListAuditLogsFilters,
} from '@/domain/audit-log/application/repositories/audit-log-repository'
import { AuditLog } from '@/domain/audit-log/enterprise/entities/audit-log'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { PrismaAuditLogMapper } from '../../mappers/audit-log/prisma-audit-log.mapper'
import { ActorType, type Prisma } from '@prisma/client'
import type { CursorPaginationParams } from '@/core/repositories/pagination-params'

@Injectable()
export class PrismaAuditLogRepository implements AuditLogRepository {
  constructor(private prisma: PrismaService) {}

  async create(auditLog: AuditLog): Promise<void> {
    const data = PrismaAuditLogMapper.toPrisma(auditLog)
    await this.prisma.auditLog.create({ data })
  }

  async resolveActorIdByEmail(
    actorType: ActorType,
    email: string,
  ): Promise<string | undefined> {
    if (actorType === 'USER') {
      const user = await this.prisma.user.findUnique({ where: { email } })
      return user?.id
    }

    if (actorType === 'CLIENT') {
      const client = await this.prisma.client.findUnique({ where: { email } })
      return client?.id
    }

    return undefined
  }

  async findMany(
    filters: ListAuditLogsFilters,
    pagination: CursorPaginationParams,
  ): Promise<[AuditLog[], boolean]> {
    const { actorType, actorId, entity, action, entityId, startDate, endDate } =
      filters

    const { cursor, limit } = pagination

    const createdAtRange: { gte?: Date; lte?: Date } = {}
    if (startDate) createdAtRange.gte = startDate
    if (endDate) createdAtRange.lte = endDate

    const where: Prisma.AuditLogWhereInput = {
      actorType,
      ...(actorId ? { actorId } : {}),
      ...(entity ? { entity } : {}),
      ...(action ? { action } : {}),
      ...(entityId ? { entityId } : {}),
      ...(startDate || endDate ? { createdAt: createdAtRange } : {}),
    }

    const results = await this.prisma.auditLog.findMany({
      where,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
    })

    const hasNextPage = results.length > limit
    const items = hasNextPage ? results.slice(0, -1) : results

    return [items.map(PrismaAuditLogMapper.toDomain), hasNextPage]
  }
}
