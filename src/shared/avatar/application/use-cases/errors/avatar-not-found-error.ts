import { BaseError } from '@/core/errors/use-case-error'

export class AvatarNotFoundError extends BaseError {
  constructor(message = 'Avatar not found') {
    super(message, 'AvatarNotFoundError')
  }
}
