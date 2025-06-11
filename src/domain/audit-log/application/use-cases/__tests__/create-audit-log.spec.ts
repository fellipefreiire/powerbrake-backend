import { InMemoryAuditLogRepository } from 'test/repositories/audit-log/in-memory-audit-log.repository'
import { beforeEach, describe, expect, it } from 'vitest'
import { CreateAuditLogUseCase } from '../create-audit-log'

let sut: CreateAuditLogUseCase
let auditLogRepository: InMemoryAuditLogRepository

describe('Create Audit Log Use Case', () => {
  beforeEach(() => {
    auditLogRepository = new InMemoryAuditLogRepository()
    sut = new CreateAuditLogUseCase(auditLogRepository)
  })

  it('should create a new audit log entry', async () => {
    const result = await sut.execute({
      actorId: 'user-1',
      actorType: 'USER',
      action: 'user:password_changed',
      entity: 'USER',
      entityId: 'user-1',
      changes: { passwordChanged: true },
    })

    expect(result.isRight()).toBe(true)
    expect(auditLogRepository.items).toHaveLength(1)
    expect(auditLogRepository.items[0].action).toBe('user:password_changed')
    expect(auditLogRepository.items[0].changes).toEqual({
      passwordChanged: true,
    })
  })
})
