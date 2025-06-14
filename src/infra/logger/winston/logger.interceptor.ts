import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable, tap, catchError, throwError } from 'rxjs'

import { SERVICE_TAG } from '@/infra/decorators/service-tag.decorator'
import { LoggerService } from './logger.service'

@Injectable()
export class RequestLoggingInterceptor
  implements NestInterceptor<unknown, unknown>
{
  constructor(
    private readonly logger: LoggerService,
    private readonly reflector: Reflector,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> {
    const http = context.switchToHttp()
    const req = http.getRequest()
    const res = http.getResponse()
    const start = Date.now()

    const service =
      this.reflector.get<string>(SERVICE_TAG, context.getClass()) ?? 'api'

    const baseMeta = {
      service,
      route: req.originalUrl,
      httpMethod: req.method,
    }

    return next.handle().pipe(
      tap(() => {
        const status = res.statusCode
        this.logger.info(`[${status}] Request handled`, {
          ...baseMeta,
          timeToComplete: Date.now() - start,
        })
      }),

      catchError((err) => {
        const status = err instanceof HttpException ? err.getStatus() : 500

        this.logger.error(`[${status}] ${err.message ?? 'Unhandled error'}`, {
          ...baseMeta,
          timeToComplete: Date.now() - start,
        })

        return throwError(() => err)
      }),
    )
  }
}
