import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { RateLimitService } from './rate-limit.service'
import { Reflector } from '@nestjs/core'
import type { RateLimitOptions } from './rate-limit.decorator'

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>()
    const res = context.switchToHttp().getResponse<Response>()
    const ip: string = req.ip ?? 'unknown'

    const rateLimitOptions = this.reflector.get<RateLimitOptions>(
      'rateLimitOptions',
      context.getHandler(),
    )

    const points =
      rateLimitOptions && typeof rateLimitOptions.points === 'number'
        ? rateLimitOptions.points
        : undefined

    const duration =
      rateLimitOptions && typeof rateLimitOptions.duration === 'number'
        ? rateLimitOptions.duration
        : undefined

    try {
      const result = await this.rateLimitService.consume(ip, points, duration)

      if (!result.allowed) {
        const retryAfterSec = Math.ceil(result.retryAfter / 1000) || 1
        res.setHeader('Retry-After', retryAfterSec)
        throw new HttpException(
          'Too many requests',
          HttpStatus.TOO_MANY_REQUESTS,
        )
      }

      return true
    } catch {
      res.setHeader('Retry-After', 60)
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS)
    }
  }
}
