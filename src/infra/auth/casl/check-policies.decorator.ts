import { SetMetadata, type ExecutionContext } from '@nestjs/common'
import { AppAbility } from './ability.factory'

export type PolicyHandler = (
  ability: AppAbility,
  context: ExecutionContext,
) => boolean

export const CHECK_POLICIES_KEY = 'check_policies'
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers)
