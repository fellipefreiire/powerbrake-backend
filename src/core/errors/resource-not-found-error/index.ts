import { BaseError } from '../use-case-error'

export class ResourceNotFoundError extends BaseError {
  constructor(message = 'Resource not found') {
    super(message, 'ResourceNotFoundError')
  }
}
