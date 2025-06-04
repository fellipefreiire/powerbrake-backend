import { BaseError } from '@/core/errors/use-case-error'

export class UserAlreadyExistsError extends BaseError {
  constructor(identifier: string) {
    super(`User ${identifier} already exists`, 'UserAlreadyExistsError')
  }
}
