import { BaseError } from '../use-case-error'

export class NotAllowedError extends BaseError {
  constructor(message = 'Not allowed') {
    super(message, 'NotAllowedError')
  }
}
