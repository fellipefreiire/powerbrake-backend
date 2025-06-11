import { ListAuditLogsUseCase } from '@/domain/audit-log/application/use-cases/list-audit-logs'
import { makeAuditLog } from 'test/factories/make-audit-log'
import { makeUser } from 'test/factories/make-user'
import { ActorType } from '@prisma/client'
import { InMemoryUsersRepository } from 'test/repositories/user/in-memory-users-repository'
import { InMemoryAuditLogRepository } from 'test/repositories/audit-log/in-memory-audit-log.repository'

describe('List Audit Logs Use Case', () => {
  let auditLogRepository: InMemoryAuditLogRepository
  let usersRepository: InMemoryUsersRepository
  let sut: ListAuditLogsUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    auditLogRepository = new InMemoryAuditLogRepository(usersRepository)
    sut = new ListAuditLogsUseCase(auditLogRepository, usersRepository)
  })

  it('should list audit logs by actorType', async () => {
    const user = makeUser({ role: 'ADMIN' })
    await usersRepository.create(user)

    const log1 = makeAuditLog({
      actorId: user.id.toString(),
      actorType: ActorType.USER,
    })
    const log2 = makeAuditLog({
      actorId: user.id.toString(),
      actorType: ActorType.USER,
    })
    const logOther = makeAuditLog({
      actorId: 'some-id',
      actorType: ActorType.CLIENT,
    })

    await auditLogRepository.create(log1)
    await auditLogRepository.create(log2)
    await auditLogRepository.create(logOther)

    const result = await sut.execute({
      params: { actorType: ActorType.USER },
      cursorParams: { limit: 10 },
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { data, meta } = result.value

      expect(data).toHaveLength(2)
      expect(meta.count).toBe(2)

      expect(data.every((log) => log.actorName === user.name)).toBe(true)
      expect(data.every((log) => log.actorEmail === user.email)).toBe(true)
      expect(data.every((log) => log.actorType === ActorType.USER)).toBe(true)
    }
  })

  it('should return empty array if actorEmail does not resolve to any user', async () => {
    const user = makeUser({ email: 'existent@example.com' })
    await usersRepository.create(user)

    const log = makeAuditLog({
      actorId: user.id.toString(),
      actorType: ActorType.USER,
    })

    await auditLogRepository.create(log)

    const result = await sut.execute({
      params: {
        actorType: ActorType.USER,
        actorEmail: 'nonexistent@example.com',
      },
      cursorParams: {
        limit: 10,
      },
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { data, meta } = result.value

      expect(data).toHaveLength(0)
      expect(meta.count).toBe(0)
      expect(meta.hasNextPage).toBe(false)
    }
  })

  it('should resolve actorEmail into actorId and return correct logs', async () => {
    const user = makeUser({ email: 'admin@email.com' })
    await usersRepository.create(user)

    const log = makeAuditLog({
      actorId: user.id.toString(),
      actorType: ActorType.USER,
    })
    await auditLogRepository.create(log)

    const result = await sut.execute({
      params: {
        actorType: ActorType.USER,
        actorEmail: user.email,
      },
      cursorParams: {
        limit: 10,
      },
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { data, meta } = result.value

      expect(data).toHaveLength(1)
      expect(meta.count).toBe(1)

      expect(data[0].actorEmail).toBe(user.email)
      expect(data[0].actorName).toBe(user.name)
    }
  })
})
