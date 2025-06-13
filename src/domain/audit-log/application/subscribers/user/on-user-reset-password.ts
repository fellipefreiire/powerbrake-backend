import { Injectable } from '@nestjs/common'
import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { UserResetPasswordEvent } from '@/domain/user/enterprise/events/user-reset-password-event'
import { CreateAuditLogUseCase } from '@/domain/audit-log/application/use-cases/create-audit-log'

@Injectable()
export class OnUserResetPassword implements EventHandler {
  constructor(private createAuditLog: CreateAuditLogUseCase) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(this.handle.bind(this), UserResetPasswordEvent.name)
  }

  async handle(event: UserResetPasswordEvent): Promise<void> {
    const user = event.user

    await this.createAuditLog.execute({
      actorId: user.id.toString(),
      actorType: 'USER',
      action: 'user:reset_password',
      entity: 'USER',
      entityId: user.id.toString(),
    })
  }
}
