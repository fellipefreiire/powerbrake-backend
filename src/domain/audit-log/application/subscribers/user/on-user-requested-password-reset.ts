import { Injectable } from '@nestjs/common'
import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { CreateAuditLogUseCase } from '@/domain/audit-log/application/use-cases/create-audit-log'
import { UserRequestedPasswordResetEvent } from '@/domain/user/enterprise/events/user-request-password-reset-event'

@Injectable()
export class OnUserRequestedPasswordReset implements EventHandler {
  constructor(private createAuditLog: CreateAuditLogUseCase) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.handle.bind(this),
      UserRequestedPasswordResetEvent.name,
    )
  }

  async handle(event: UserRequestedPasswordResetEvent): Promise<void> {
    const user = event.user

    await this.createAuditLog.execute({
      actorId: user.id.toString(),
      actorType: 'USER',
      action: 'user:requested_password_reset',
      entity: 'USER',
      entityId: user.id.toString(),
    })
  }
}
