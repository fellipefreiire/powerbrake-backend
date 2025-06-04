import { BaseError } from '@/core/errors/use-case-error'

export class WrongCredentialsError extends BaseError {
  constructor(message = 'Credentials are not valid.') {
    super(message, 'WrongCredentialsError')
  }
}
