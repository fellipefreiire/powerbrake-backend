import { BaseError } from '@/core/errors/use-case-error'

export class UserInactiveError extends BaseError {
  constructor(message = 'User inactive') {
    super(message, 'UserInactiveError')
  }
}
