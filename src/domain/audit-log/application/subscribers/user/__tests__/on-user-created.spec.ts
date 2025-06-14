import { vi } from 'vitest'
import { waitFor } from 'test/utils/wait-for'
import { makeUser } from 'test/factories/make-user'
import { DomainEvents } from '@/core/events/domain-events'
import { OnUserCreated } from '@/domain/audit-log/application/subscribers/user/on-user-created'
import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { InMemoryAuditLogRepository } from 'test/repositories/audit-log/in-memory-audit-log.repository'
import { CreateAuditLogUseCase } from '@/domain/audit-log/application/use-cases/create-audit-log'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryAuditLogRepository: InMemoryAuditLogRepository
let createAuditLogUseCase: CreateAuditLogUseCase
let createAuditLogSpy: ReturnType<typeof vi.spyOn>

describe('On User Created (subscriber)', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryAuditLogRepository = new InMemoryAuditLogRepository(
      inMemoryUsersRepository,
    )
    createAuditLogUseCase = new CreateAuditLogUseCase(
      inMemoryAuditLogRepository,
    )
    createAuditLogSpy = vi.spyOn(createAuditLogUseCase, 'execute')

    new OnUserCreated(createAuditLogUseCase)
  })

  it('should create audit log when user is created', async () => {
    const user = makeUser(
      {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'MANAGER',
      },
      undefined,
      new UniqueEntityID('creator-id'),
    )

    inMemoryUsersRepository.create(user)

    DomainEvents.dispatchEventsForAggregate(user.id)

    await waitFor(() => {
      expect(createAuditLogSpy).toHaveBeenCalled()
    })

    expect(inMemoryAuditLogRepository.items).toHaveLength(1)
    expect(inMemoryAuditLogRepository.items[0]).toEqual(
      expect.objectContaining({
        actorId: 'creator-id',
        action: 'user:created',
        entityId: user.id.toString(),
        changes: {
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      }),
    )
  })
})
