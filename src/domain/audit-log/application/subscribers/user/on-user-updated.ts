import { Injectable } from '@nestjs/common'
import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { UserUpdatedEvent } from '@/domain/user/enterprise/events/user-updated-event'
import { CreateAuditLogUseCase } from '@/domain/audit-log/application/use-cases/create-audit-log'

type UserUpdatedChanges = {
  name: {
    before: string
    after: string
  }
  avatarId: {
    before: string | null | undefined
    after: string | null | undefined
  }
  addresses: {
    before: unknown
    after: unknown
  }
}

@Injectable()
export class OnUserUpdated implements EventHandler {
  constructor(private createAuditLog: CreateAuditLogUseCase) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(this.handle.bind(this), UserUpdatedEvent.name)
  }

  async handle(event: UserUpdatedEvent): Promise<void> {
    const user = event.user
    const previous = event.previousData

    const changes: UserUpdatedChanges = {
      name: {
        before: previous.name,
        after: user.name,
      },
      avatarId: {
        before: previous.avatarId?.toString(),
        after: user.avatarId?.toString(),
      },
      addresses: {
        before: previous.addresses,
        after: user.addresses,
      },
    }

    await this.createAuditLog.execute({
      actorId: user.id.toString(),
      actorType: 'USER',
      action: 'user:updated',
      entity: 'USER',
      entityId: user.id.toString(),
      changes,
    })
  }
}
