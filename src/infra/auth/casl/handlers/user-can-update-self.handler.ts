import type { ExecutionContext } from '@nestjs/common'
import type { Role } from '@prisma/client'
import type { PolicyHandler } from '../check-policies.decorator'

export const userCanUpdateSelfHandler: PolicyHandler = (
  ability,
  context: ExecutionContext,
) => {
  const req = context.switchToHttp().getRequest()

  const targetUserId = req.params.id as string

  const subject = {
    sub: targetUserId,
    role: '' as Role,
    __typename: 'User' as const,
  }

  return ability.can('update', subject)
}
