import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common'
import { Response } from 'express'
import { ZodError } from 'zod'
import { BaseError } from '@/core/errors/use-case-error'

@Catch()
export class AppErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppErrorFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<Response>()

    if (exception instanceof ZodError) {
      res.status(422).json({
        statusCode: 422,
        error: 'Unprocessable Entity',
        message: exception.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      })
      return
    }

    if (exception instanceof BaseError) {
      const status = this.mapDomainErrorToStatus(exception.name)
      res.status(status).json({
        statusCode: status,
        error: this.statusToText(status),
        message: exception.message,
      })
      return
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const body = exception.getResponse()
      res.status(status).json({
        statusCode: status,
        error: this.statusToText(status),
        ...(typeof body === 'string' ? { message: body } : body),
      })
      return
    }

    this.logger.error(exception)
    res.status(500).json({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Internal server error',
    })
  }

  protected mapDomainErrorToStatus(name: string): number {
    return (
      {
        InvalidAvatarTypeError: 400,
      }[name] ?? 400
    )
  }

  private statusToText(code: number): string {
    return (
      (
        {
          400: 'Bad Request',
          401: 'Unauthorized',
          403: 'Forbidden',
          404: 'Not Found',
          409: 'Conflict',
          422: 'Unprocessable Entity',
          429: 'Too Many Requests',
          500: 'Internal Server Error',
        } as const
      )[code] ?? 'Error'
    )
  }
}
