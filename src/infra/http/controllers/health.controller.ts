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
// Supondo que os DTOs estão em:

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
    summary: 'Verifica a saúde da aplicação e seus serviços dependentes.',
    description:
      'Retorna o status de cada componente monitorado (banco de dados, Redis, S3). O status geral será "ok" se todos os componentes estiverem saudáveis, ou "error" se algum componente falhar.',
  })
  @ApiOkResponse({
    description:
      'Todos os serviços estão operacionais e a aplicação está saudável.',
    type: HealthCheckResponseDto,
  })
  @ApiServiceUnavailableResponse({
    description:
      'Um ou mais serviços estão indisponíveis ou a aplicação não está saudável.',
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
