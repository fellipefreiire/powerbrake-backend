import {
  Controller,
  Get,
  HttpCode,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common'
import {
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { ServiceTag } from '@/infra/decorators/service-tag.decorator'
import { CaslAbilityGuard } from '@/infra/auth/casl/casl-ability.guard'
import { CheckPolicies } from '@/infra/auth/casl/check-policies.decorator'
import { AuditLogPresenter } from '../../presenters/audit-log.presenter'
import {
  InternalServerErrorDto,
  UnprocessableEntityDto,
} from '../../dtos/error/generic'

import { z } from 'zod'
import { ActorType } from '@prisma/client'
import { ListAuditLogsUseCase } from '@/domain/audit-log/application/use-cases/list-audit-logs'
import { ZodValidationPipe } from '../../pipes'
import { AuditLogListResponseDto } from '../../dtos/response/audit-log'
import { AuditLogErrorFilter } from '../../filters/audit-log-error.filter'

export const listAuditLogsQuerySchema = z.object({
  actorType: z.nativeEnum(ActorType),
  actorEmail: z.string().email().optional(),
  entity: z.string().optional(),
  action: z.string().optional(),
  entityId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
})

export type ListAuditLogsQuerySchema = z.infer<typeof listAuditLogsQuerySchema>

@UseFilters(AuditLogErrorFilter)
@ApiTags('Audit Logs')
@ServiceTag('audit-log')
@Controller({ path: 'audit-logs', version: '1' })
export class ListAuditLogsController {
  constructor(private listAuditLogsUseCase: ListAuditLogsUseCase) {}

  @UseGuards(CaslAbilityGuard)
  @CheckPolicies((ability) => ability.can('list', 'AuditLog'))
  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'List audit logs with filters and pagination' })
  @ApiQuery({
    name: 'actorType',
    enum: ActorType,
    required: true,
    example: ActorType.USER,
  })
  @ApiQuery({
    name: 'actorEmail',
    required: false,
    example: 'admin@empresa.com',
  })
  @ApiQuery({ name: 'entity', required: false, example: 'User' })
  @ApiQuery({ name: 'action', required: false, example: 'update-password' })
  @ApiQuery({ name: 'entityId', required: false, example: 'usr_1234567890' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    example: '2024-06-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    example: '2024-06-30T23:59:59.000Z',
  })
  @ApiQuery({ name: 'cursor', required: false, example: 'log_abcdef123456' })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({ type: AuditLogListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiUnprocessableEntityResponse({ type: UnprocessableEntityDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  async handle(
    @Query(new ZodValidationPipe(listAuditLogsQuerySchema))
    query: ListAuditLogsQuerySchema,
  ) {
    const {
      actorType,
      actorEmail,
      entity,
      action,
      entityId,
      startDate,
      endDate,
      cursor,
      limit,
    } = query

    const result = await this.listAuditLogsUseCase.execute({
      params: {
        actorType,
        actorEmail,
        entity,
        action,
        entityId,
        startDate,
        endDate,
      },
      cursorParams: {
        cursor,
        limit,
      },
    })

    if (result.isRight()) {
      const { data, meta } = result.value

      return {
        data: data.map(AuditLogPresenter.toHTTP),
        meta,
      }
    }

    throw result.value
  }
}
