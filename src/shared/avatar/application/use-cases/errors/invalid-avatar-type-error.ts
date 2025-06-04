import { BaseError } from '@/core/errors/use-case-error'

export class InvalidAvatarTypeError extends BaseError {
  constructor(type: string) {
    super(`File type "${type}" is not valid.`, 'InvalidAvatarTypeError')
  }
}
