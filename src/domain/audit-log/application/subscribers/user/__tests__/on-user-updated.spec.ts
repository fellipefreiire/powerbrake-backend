import { vi } from 'vitest'
import { waitFor } from 'test/utils/wait-for'
import { makeUser } from 'test/factories/make-user'
import { DomainEvents } from '@/core/events/domain-events'
import { OnUserUpdated } from '@/domain/audit-log/application/subscribers/user/on-user-updated'
import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { InMemoryAuditLogRepository } from 'test/repositories/audit-log/in-memory-audit-log.repository'
import { CreateAuditLogUseCase } from '@/domain/audit-log/application/use-cases/create-audit-log'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Address } from '@/shared/address/enterprise/entities/address'
import { UserAddressList } from '@/domain/user/enterprise/entities/user-address-list'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryAuditLogRepository: InMemoryAuditLogRepository
let createAuditLogUseCase: CreateAuditLogUseCase
let createAuditLogSpy: ReturnType<typeof vi.spyOn>

describe('On User Updated (subscriber)', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryAuditLogRepository = new InMemoryAuditLogRepository(
      inMemoryUsersRepository,
    )
    createAuditLogUseCase = new CreateAuditLogUseCase(
      inMemoryAuditLogRepository,
    )
    createAuditLogSpy = vi.spyOn(createAuditLogUseCase, 'execute')

    new OnUserUpdated(createAuditLogUseCase)
  })

  it('should create audit log when user is updated', async () => {
    const userId = new UniqueEntityID('user-id')

    const user = makeUser(
      {
        name: 'Old Name',
        avatarId: new UniqueEntityID('old-avatar'),
        addresses: [
          Address.create({
            street: 'Rua Antiga',
            number: '999',
            complement: null,
            neighborhood: 'Bairro Antigo',
            city: 'Cidade Velha',
            state: 'RJ',
            zipCode: '00000-000',
            userId,
          }),
        ],
      },
      userId,
    )

    inMemoryUsersRepository.create(user)

    user.update({
      name: 'New Name',
      avatarId: new UniqueEntityID('new-avatar'),
      addresses: new UserAddressList([
        Address.create({
          street: 'Rua Nova',
          number: '123',
          complement: null,
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '12345-678',
          userId,
        }),
      ]),
    })

    inMemoryUsersRepository.save(user)

    DomainEvents.dispatchEventsForAggregate(user.id)

    await waitFor(() => {
      expect(createAuditLogSpy).toHaveBeenCalled()
    })

    expect(inMemoryAuditLogRepository.items).toHaveLength(1)
    expect(inMemoryAuditLogRepository.items[0]).toEqual(
      expect.objectContaining({
        actorId: 'user-id',
        action: 'user:updated',
        entityId: 'user-id',
      }),
    )
  })
})
