import { Injectable } from '@nestjs/common'
import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { UserPasswordChangedEvent } from '@/domain/user/enterprise/events/user-password-changed-event'
import { CreateAuditLogUseCase } from '@/domain/audit-log/application/use-cases/create-audit-log'

@Injectable()
export class OnUserPasswordChanged implements EventHandler {
  constructor(private createAuditLog: CreateAuditLogUseCase) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(this.handle.bind(this), UserPasswordChangedEvent.name)
  }

  private async handle(event: UserPasswordChangedEvent): Promise<void> {
    await this.createAuditLog.execute({
      actorId: event.user.id.toString(),
      actorType: 'USER',
      action: 'user:password_changed',
      entity: 'USER',
      entityId: event.user.id.toString(),
      changes: {
        passwordChanged: true,
      },
    })
  }
}
