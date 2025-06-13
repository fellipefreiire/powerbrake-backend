import { vi } from 'vitest'
import { waitFor } from 'test/utils/wait-for'
import { makeUser } from 'test/factories/make-user'
import { DomainEvents } from '@/core/events/domain-events'
import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { InMemoryAuditLogRepository } from 'test/repositories/audit-log/in-memory-audit-log.repository'
import { CreateAuditLogUseCase } from '@/domain/audit-log/application/use-cases/create-audit-log'
import { OnUserResetPassword } from '@/domain/audit-log/application/subscribers/user/on-user-reset-password'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryAuditLogRepository: InMemoryAuditLogRepository
let createAuditLogUseCase: CreateAuditLogUseCase
let createAuditLogSpy: ReturnType<typeof vi.spyOn>

describe('On User Reset Password (subscriber)', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryAuditLogRepository = new InMemoryAuditLogRepository(
      inMemoryUsersRepository,
    )
    createAuditLogUseCase = new CreateAuditLogUseCase(
      inMemoryAuditLogRepository,
    )
    createAuditLogSpy = vi.spyOn(createAuditLogUseCase, 'execute')

    new OnUserResetPassword(createAuditLogUseCase)
  })

  it('should create audit log when user resets password', async () => {
    const user = makeUser()
    inMemoryUsersRepository.create(user)

    user.resetPassword('password-hashed')
    inMemoryUsersRepository.save(user)

    DomainEvents.dispatchEventsForAggregate(user.id)

    await waitFor(() => {
      expect(createAuditLogSpy).toHaveBeenCalled()
    })

    expect(inMemoryAuditLogRepository.items).toHaveLength(1)
    expect(inMemoryAuditLogRepository.items[0]).toEqual(
      expect.objectContaining({
        actorId: user.id.toString(),
        actorType: 'USER',
        action: 'user:reset_password',
        entity: 'USER',
        entityId: user.id.toString(),
      }),
    )
  })
})
