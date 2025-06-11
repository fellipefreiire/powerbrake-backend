import { Injectable } from '@nestjs/common'
import { type Either, right } from '@/core/either'
import type {
  CursorPaginationParams,
  CursorPaginationMeta,
} from '@/core/repositories/pagination-params'
import { AuditLog } from '../../enterprise/entities/audit-log'
import {
  AuditLogRepository,
  ListAuditLogsFilters,
} from '../repositories/audit-log-repository'
import { ActorType } from '@prisma/client'
import { UsersRepository } from '@/domain/user/application/repositories/user-repository'

type ListAuditLogsUseCaseRequest = {
  params: ListAuditLogsFilters
  cursorParams: CursorPaginationParams
}

type AuditLogWithActorInfo = AuditLog & {
  actorName: string
  actorEmail: string
}

type ListAuditLogsUseCaseResponse = Either<
  null,
  {
    data: AuditLogWithActorInfo[]
    meta: CursorPaginationMeta
  }
>

@Injectable()
export class ListAuditLogsUseCase {
  constructor(
    private auditLogsRepository: AuditLogRepository,
    private usersRepository: UsersRepository,
    // private clientsRepository: ClientsRepository,
  ) {}

  async execute({
    params,
    cursorParams,
  }: ListAuditLogsUseCaseRequest): Promise<ListAuditLogsUseCaseResponse> {
    const {
      actorType,
      actorId: filterActorId,
      actorEmail,
      entity,
      action,
      entityId,
      startDate,
      endDate,
    } = params

    let actorId = filterActorId

    if (!actorId && actorEmail) {
      actorId = await this.auditLogsRepository.resolveActorIdByEmail(
        actorType,
        actorEmail,
      )

      if (!actorId) {
        return right({
          data: [],
          meta: {
            count: 0,
            hasNextPage: false,
            nextCursor: null,
          },
        })
      }
    }

    const [logs, hasNextPage] = await this.auditLogsRepository.findMany(
      {
        actorType,
        actorId,
        entity,
        action,
        entityId,
        startDate,
        endDate,
      },
      cursorParams,
    )

    const userIds = logs
      .filter((log) => log.actorType === ActorType.USER)
      .map((log) => log.actorId)

    const uniqueUserIds = [...new Set(userIds)]
    const users = await this.usersRepository.findManyByIds(uniqueUserIds)
    const usersMap = new Map(users.map((user) => [user.id.toString(), user]))

    const logsWithActors: AuditLogWithActorInfo[] = logs.map((log) => {
      let actorName = '[unknown]'
      let actorEmail = '[unknown]'

      if (log.actorType === ActorType.USER) {
        const user = usersMap.get(log.actorId)
        if (user) {
          actorName = user.name
          actorEmail = user.email
        }
      }

      // se no futuro quiser CLIENT, basta expandir aqui

      const extended = Object.assign(
        Object.create(Object.getPrototypeOf(log)),
        log,
      ) as AuditLogWithActorInfo

      extended.actorName = actorName
      extended.actorEmail = actorEmail

      return extended
    })

    return right({
      data: logsWithActors,
      meta: {
        count: logs.length,
        hasNextPage,
        nextCursor: hasNextPage ? logs[logs.length - 1].id.toString() : null,
      },
    })
  }
}
