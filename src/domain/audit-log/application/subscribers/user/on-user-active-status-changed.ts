import { Injectable } from '@nestjs/common'
import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { UserActiveStatusChangedEvent } from '@/domain/user/enterprise/events/user-active-status-changed-event'
import { CreateAuditLogUseCase } from '@/domain/audit-log/application/use-cases/create-audit-log'

@Injectable()
export class OnUserActiveStatusChanged implements EventHandler {
  constructor(private createAuditLog: CreateAuditLogUseCase) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.handle.bind(this),
      UserActiveStatusChangedEvent.name,
    )
  }

  async handle(event: UserActiveStatusChangedEvent): Promise<void> {
    const { user, previousIsActive, actorId } = event

    await this.createAuditLog.execute({
      actorId,
      actorType: 'USER',
      action: 'user:active_status_updated',
      entity: 'USER',
      entityId: user.id.toString(),
      changes: {
        isActive: {
          before: previousIsActive,
          after: user.isActive,
        },
      },
    })
  }
}
