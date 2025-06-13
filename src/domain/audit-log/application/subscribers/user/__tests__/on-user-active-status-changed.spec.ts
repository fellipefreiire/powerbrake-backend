import { vi } from 'vitest'
import { waitFor } from 'test/utils/wait-for'
import { makeUser } from 'test/factories/make-user'
import { DomainEvents } from '@/core/events/domain-events'
import { OnUserActiveStatusChanged } from '@/domain/audit-log/application/subscribers/user/on-user-active-status-changed'
import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { InMemoryAuditLogRepository } from 'test/repositories/audit-log/in-memory-audit-log.repository'
import { CreateAuditLogUseCase } from '@/domain/audit-log/application/use-cases/create-audit-log'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryAuditLogRepository: InMemoryAuditLogRepository
let createAuditLogUseCase: CreateAuditLogUseCase
let createAuditLogSpy: ReturnType<typeof vi.spyOn>

describe('On User Active Status Changed (subscriber)', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryAuditLogRepository = new InMemoryAuditLogRepository(
      inMemoryUsersRepository,
    )
    createAuditLogUseCase = new CreateAuditLogUseCase(
      inMemoryAuditLogRepository,
    )
    createAuditLogSpy = vi.spyOn(createAuditLogUseCase, 'execute')

    new OnUserActiveStatusChanged(createAuditLogUseCase)
  })

  it('should create audit log when user active status is changed', async () => {
    const actorId = new UniqueEntityID('admin-id')
    const user = makeUser({ isActive: true }, new UniqueEntityID('user-id'))

    inMemoryUsersRepository.create(user)

    user.toggleActive(actorId.toString())
    inMemoryUsersRepository.save(user)

    DomainEvents.dispatchEventsForAggregate(user.id)

    await waitFor(() => {
      expect(createAuditLogSpy).toHaveBeenCalled()
    })

    expect(inMemoryAuditLogRepository.items).toHaveLength(1)
    expect(inMemoryAuditLogRepository.items[0]).toEqual(
      expect.objectContaining({
        actorId: 'admin-id',
        action: 'user:active_status_updated',
        entityId: 'user-id',
        changes: {
          isActive: {
            before: true,
            after: false,
          },
        },
      }),
    )
  })
})
