import { faker } from '@faker-js/faker'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  AuditLog,
  type AuditLogProps,
} from '@/domain/audit-log/enterprise/entities/audit-log'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { PrismaAuditLogMapper } from '@/infra/database/prisma/mappers/audit-log/prisma-audit-log.mapper'

export function makeAuditLog(
  override: Partial<AuditLogProps> = {},
  id?: UniqueEntityID,
) {
  const auditLog = AuditLog.create(
    {
      actorId: faker.string.uuid(),
      actorType: 'USER',
      action: 'create',
      entity: 'User',
      entityId: faker.string.uuid(),
      changes: { name: 'new name' },
      ...override,
    },
    id,
  )

  return auditLog
}

@Injectable()
export class AuditLogFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaAuditLog(
    data: Partial<AuditLogProps> = {},
  ): Promise<AuditLog> {
    const auditLog = makeAuditLog(data)

    await this.prisma.auditLog.create({
      data: PrismaAuditLogMapper.toPrisma(auditLog),
    })

    return auditLog
  }
}
