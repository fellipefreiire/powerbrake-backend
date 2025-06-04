import { BaseError } from '@/core/errors/use-case-error'

export class InvalidRoleTransitionError extends BaseError {
  constructor(message = 'You cannot change roles') {
    super(message, 'InvalidRoleTransitionError')
  }
}
