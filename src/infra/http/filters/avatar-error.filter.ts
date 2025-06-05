import { Catch } from '@nestjs/common'
import { AppErrorFilter } from './app-error.filter'
import { InvalidAvatarTypeError } from '@/shared/avatar/application/use-cases/errors/invalid-avatar-type-error'
import { AvatarUploadFailedError } from '@/shared/avatar/application/use-cases/errors/avatar-upload-failed-error'

@Catch()
export class AvatarErrorFilter extends AppErrorFilter {
  protected override mapDomainErrorToStatus(name: string): number {
    switch (name) {
      case InvalidAvatarTypeError.name:
        return 400
      case AvatarUploadFailedError.name:
        return 500
      default:
        return super.mapDomainErrorToStatus(name)
    }
  }
}
