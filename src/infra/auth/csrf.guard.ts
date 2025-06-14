import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common'
import { Request } from 'express'

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()

    const cookies = request.cookies ?? {}
    const csrfHeader = request.headers['x-csrf-token']
    const csrfCookie = cookies['csrfToken']

    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
      throw new ForbiddenException('Invalid CSRF token')
    }

    return true
  }
}
