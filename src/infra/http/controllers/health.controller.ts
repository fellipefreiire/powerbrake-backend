import { Public } from '@/infra/auth/public'
import { ServiceTag } from '@/infra/decorators/service-tag.decorator'
import { Controller, Get } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger'
import {
  HealthCheckService,
  HealthCheck,
  HealthCheckResult,
} from '@nestjs/terminus'
import { PrismaHealthIndicator } from '../indicators/prisma-health.indicator'
import { RedisHealthIndicator } from '../indicators/redis-health.indicator'
import { S3HealthIndicator } from '../indicators/s3-health.indicator'
import { HealthCheckResponseDto } from '../dtos/common/health-check-response.dto'

@ApiTags('Health')
@ServiceTag('health')
@Public()
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
    private redis: RedisHealthIndicator,
    private s3: S3HealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Check application health and its dependent services.',
    description:
      'Returns the status of monitored components (database, Redis, S3). Overall status will be "ok" if all components are healthy, or "error" if any component fails.',
  })
  @ApiOkResponse({
    description: 'All services are operational and the application is healthy.',
    type: HealthCheckResponseDto,
  })
  @ApiServiceUnavailableResponse({
    description:
      'One or more services are unavailable or the application is unhealthy.',
    type: HealthCheckResponseDto,
  })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prisma.isHealthy('database'),
      () => this.redis.isHealthy('redis'),
      () => this.s3.isHealthy('s3'),
    ])
  }
}
