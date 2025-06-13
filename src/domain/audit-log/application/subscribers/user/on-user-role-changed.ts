import { Injectable } from '@nestjs/common'
import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { UserRoleChangedEvent } from '@/domain/user/enterprise/events/user-role-changed-event'
import { CreateAuditLogUseCase } from '@/domain/audit-log/application/use-cases/create-audit-log'

@Injectable()
export class OnUserRoleChanged implements EventHandler {
  constructor(private createAuditLog: CreateAuditLogUseCase) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(this.handle.bind(this), UserRoleChangedEvent.name)
  }

  async handle(event: UserRoleChangedEvent): Promise<void> {
    const { user, actorId, previousRole } = event

    await this.createAuditLog.execute({
      actorId,
      actorType: 'USER',
      action: 'user:role_updated',
      entity: 'USER',
      entityId: user.id.toString(),
      changes: {
        role: {
          before: previousRole,
          after: user.role,
        },
      },
    })
  }
}
