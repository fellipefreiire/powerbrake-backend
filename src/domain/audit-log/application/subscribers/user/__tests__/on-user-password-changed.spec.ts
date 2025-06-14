import { vi } from 'vitest'
import { waitFor } from 'test/utils/wait-for'
import { OnUserPasswordChanged } from '@/domain/audit-log/application/subscribers/user/on-user-password-changed'
import { CreateAuditLogUseCase } from '@/domain/audit-log/application/use-cases/create-audit-log'
import { makeUser } from 'test/factories/make-user'
import { InMemoryAuditLogRepository } from 'test/repositories/audit-log/in-memory-audit-log.repository'
import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { DomainEvents } from '@/core/events/domain-events'

let inMemoryAuditLogRepository: InMemoryAuditLogRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let createAuditLogUseCase: CreateAuditLogUseCase
let createAuditLogSpy: ReturnType<typeof vi.spyOn>

describe('On User Password Changed (subscriber)', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryAuditLogRepository = new InMemoryAuditLogRepository(
      inMemoryUsersRepository,
    )
    createAuditLogUseCase = new CreateAuditLogUseCase(
      inMemoryAuditLogRepository,
    )
    createAuditLogSpy = vi.spyOn(createAuditLogUseCase, 'execute')

    new OnUserPasswordChanged(createAuditLogUseCase)
  })

  it('should create audit log when user password is changed', async () => {
    const user = makeUser()

    inMemoryUsersRepository.create(user)

    user.updatePassword('new-password')

    inMemoryUsersRepository.save(user)

    DomainEvents.dispatchEventsForAggregate(user.id)

    await waitFor(() => {
      expect(createAuditLogSpy).toHaveBeenCalled()
    })

    expect(inMemoryAuditLogRepository.items).toHaveLength(1)
    expect(inMemoryAuditLogRepository.items[0]).toEqual(
      expect.objectContaining({
        actorId: user.id.toString(),
        action: 'user:password_changed',
        changes: {
          passwordChanged: true,
        },
      }),
    )
  })
})
