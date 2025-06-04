import { BaseError } from '@/core/errors/use-case-error'

export class UserNotFoundError extends BaseError {
  constructor(message = 'User not found') {
    super(message, 'UserNotFoundError')
  }
}
