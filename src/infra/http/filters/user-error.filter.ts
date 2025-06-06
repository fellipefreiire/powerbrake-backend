import { Catch } from '@nestjs/common'
import { AppErrorFilter } from './app-error.filter'
import {
  UserAlreadyExistsError,
  UserNotFoundError,
} from '@/domain/user/application/use-cases/errors'
import { WrongCredentialsError } from '@/domain/user/application/use-cases/errors/wrong-credentials-error'
import { UserInactiveError } from '@/domain/user/application/use-cases/errors/user-inactive-error'
import { InvalidRoleTransitionError } from '@/domain/user/application/use-cases/errors/invalid-role-transition-error'
import { UserUnauthorizedError } from '@/domain/user/application/use-cases/errors/user-unauthorized-error'

@Catch()
export class UserErrorFilter extends AppErrorFilter {
  protected override mapDomainErrorToStatus(name: string): number {
    switch (name) {
      case UserUnauthorizedError.name:
      case WrongCredentialsError.name:
        return 401
      case UserInactiveError.name:
      case InvalidRoleTransitionError.name:
        return 403
      case UserNotFoundError.name:
        return 404
      case UserAlreadyExistsError.name:
        return 409
      default:
        return super.mapDomainErrorToStatus(name)
    }
  }
}
