import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/either'
import { AuditLog } from '../../enterprise/entities/audit-log'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ActorType } from '@prisma/client'
import { AuditLogRepository } from '../repositories/audit-log-repository'

type CreateAuditLogUseCaseRequest = {
  actorId: string
  actorType: ActorType
  action: string
  entity: string
  entityId: string
  changes?: Record<string, unknown> | null
}

type CreateAuditLogUseCaseResponse = Either<null, void>

@Injectable()
export class CreateAuditLogUseCase {
  constructor(private auditLogsRepository: AuditLogRepository) {}

  async execute({
    actorId,
    actorType,
    action,
    entity,
    entityId,
    changes,
  }: CreateAuditLogUseCaseRequest): Promise<CreateAuditLogUseCaseResponse> {
    const auditLog = AuditLog.create(
      {
        actorId,
        actorType,
        action,
        entity,
        entityId,
        changes,
      },
      new UniqueEntityID(),
    )

    await this.auditLogsRepository.create(auditLog)

    return right(undefined)
  }
}
