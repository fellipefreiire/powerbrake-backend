import { Injectable } from '@nestjs/common'
import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { UserLoggedInEvent } from '@/domain/user/enterprise/events/user-logged-in-event'
import { CreateAuditLogUseCase } from '@/domain/audit-log/application/use-cases/create-audit-log'

@Injectable()
export class OnUserLoggedIn implements EventHandler {
  constructor(private createAuditLog: CreateAuditLogUseCase) {
    console.log('[SUBSCRIBER] OnUserLoggedIn registrado')

    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(this.handle.bind(this), UserLoggedInEvent.name)
  }

  async handle(event: UserLoggedInEvent): Promise<void> {
    const user = event.user
    console.log({ user })

    await this.createAuditLog.execute({
      actorId: user.id.toString(),
      actorType: 'USER',
      action: 'user:logged_in',
      entity: 'USER',
      entityId: user.id.toString(),
    })
  }
}
