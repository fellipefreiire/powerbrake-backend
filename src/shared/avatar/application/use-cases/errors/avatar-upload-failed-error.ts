import { BaseError } from '@/core/errors/use-case-error'

export class AvatarUploadFailedError extends BaseError {
  constructor(message = 'Failed to upload avatar') {
    super(message, 'AvatarUploadFailedError')
  }
}
