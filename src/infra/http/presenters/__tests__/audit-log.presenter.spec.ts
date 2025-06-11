import { AuditLogPresenter } from '../audit-log.presenter'
import { makeAuditLog } from 'test/factories/make-audit-log'
import { ActorType } from '@prisma/client'

describe('AuditLogPresenter', () => {
  it('should present AuditLog with actor name and email', () => {
    const auditLog = makeAuditLog({
      actorId: 'actor-id-123',
      actorType: ActorType.USER,
    })

    const auditLogWithActorInfo = Object.assign(
      Object.create(Object.getPrototypeOf(auditLog)),
      auditLog,
    ) as typeof auditLog & {
      actorName: string
      actorEmail: string
    }

    auditLogWithActorInfo.actorName = 'John Doe'
    auditLogWithActorInfo.actorEmail = 'john@example.com'

    const result = AuditLogPresenter.toHTTP(auditLogWithActorInfo)

    expect(result).toEqual({
      id: auditLog.id.toString(),
      actor: {
        id: auditLog.actorId,
        type: auditLog.actorType,
        name: 'John Doe',
        email: 'john@example.com',
      },
      action: auditLog.action,
      entity: auditLog.entity,
      entityId: auditLog.entityId,
      changes: auditLog.changes ?? null,
      createdAt: auditLog.createdAt,
    })
  })
})
