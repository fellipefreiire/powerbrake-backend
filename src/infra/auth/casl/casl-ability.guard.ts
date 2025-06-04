import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { CaslAbilityFactory } from './ability.factory'
import { CHECK_POLICIES_KEY, PolicyHandler } from './check-policies.decorator'

@Injectable()
export class CaslAbilityGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || []

    const request = context.switchToHttp().getRequest()
    const user = request.user
    const ability = this.caslAbilityFactory.defineAbilityFor(user)

    const isAllowed = policyHandlers.every((handler) => handler(ability))

    if (!isAllowed) {
      throw new ForbiddenException('Acesso negado')
    }

    return true
  }
}
