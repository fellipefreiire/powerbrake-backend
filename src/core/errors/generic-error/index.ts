import { BaseError } from '../use-case-error'

export class GenericUseCaseError extends BaseError {
  constructor(message = 'An unexpected error occurred') {
    super(message, 'GenericUseCaseError')
  }
}
