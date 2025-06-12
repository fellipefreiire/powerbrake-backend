import { Injectable } from '@nestjs/common'
import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { UserCreatedEvent } from '@/domain/user/enterprise/events/user-created-event'
import { CreateAuditLogUseCase } from '@/domain/audit-log/application/use-cases/create-audit-log'

@Injectable()
export class OnUserCreated implements EventHandler {
  constructor(private createAuditLog: CreateAuditLogUseCase) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(this.handle.bind(this), UserCreatedEvent.name)
  }

  async handle(event: UserCreatedEvent): Promise<void> {
    const user = event.user

    console.log({ user })

    await this.createAuditLog.execute({
      actorId: event.actorId,
      actorType: 'USER',
      action: 'user:created',
      entity: 'USER',
      entityId: user.id.toString(),
      changes: {
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    })
  }
}
