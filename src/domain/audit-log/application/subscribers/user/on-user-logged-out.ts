import { Injectable } from '@nestjs/common'
import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { UserLoggedOutEvent } from '@/domain/user/enterprise/events/user-logged-out-event'
import { CreateAuditLogUseCase } from '@/domain/audit-log/application/use-cases/create-audit-log'

@Injectable()
export class OnUserLoggedOut implements EventHandler {
  constructor(private createAuditLog: CreateAuditLogUseCase) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(this.handle.bind(this), UserLoggedOutEvent.name)
  }

  async handle(event: UserLoggedOutEvent): Promise<void> {
    const user = event.user

    await this.createAuditLog.execute({
      actorId: user.id.toString(),
      actorType: 'USER',
      action: 'user:logged_out',
      entity: 'USER',
      entityId: user.id.toString(),
    })
  }
}
