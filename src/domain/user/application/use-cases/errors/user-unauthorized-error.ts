import { BaseError } from '@/core/errors/use-case-error'

export class UserUnauthorizedError extends BaseError {
  constructor(message = 'Unauthorized') {
    super(message, 'UserUnauthorizedError')
  }
}
