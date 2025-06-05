import {
  Controller,
  Get,
  HttpCode,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common'
import { z } from 'zod'
import { UserPresenter } from '../../presenters/user.presenter'
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
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe'
import { ListUsersUseCase } from '@/domain/user/application/use-cases/list-users'
import { CaslAbilityGuard } from '@/infra/auth/casl/casl-ability.guard'
import { CheckPolicies } from '@/infra/auth/casl/check-policies.decorator'
import { ServiceTag } from '@/infra/decorators/service-tag.decorator'
import { UserErrorFilter } from '../../filters/user-error.filter'
import {
  InternalServerErrorDto,
  UnprocessableEntityDto,
} from '../../dtos/error/generic'
import { UserListResponseDto } from '../../dtos/response/user'
import { UserForbiddenDto, WrongCredentialsDto } from '../../dtos/error/user'

const querySchema = z.object({
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(20),
})
type QuerySchema = z.infer<typeof querySchema>

@UseFilters(UserErrorFilter)
@ApiTags('Users')
@ServiceTag('user')
@Controller({ path: 'users', version: '1' })
export class ListUsersController {
  constructor(private listUsersUseCase: ListUsersUseCase) {}

  @UseGuards(CaslAbilityGuard)
  @CheckPolicies((ability) => ability.can('list', 'User'))
  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'List all users (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  @ApiOkResponse({ type: UserListResponseDto })
  @ApiUnauthorizedResponse({ type: WrongCredentialsDto })
  @ApiForbiddenResponse({ type: UserForbiddenDto })
  @ApiUnprocessableEntityResponse({ type: UnprocessableEntityDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  async handle(
    @Query(new ZodValidationPipe(querySchema)) { page, perPage }: QuerySchema,
  ) {
    const result = await this.listUsersUseCase.execute({ page, perPage })

    if (result.isRight()) {
      const { data, meta } = result.value
      return {
        data: data.map(UserPresenter.toHTTP),
        meta,
      }
    }

    throw result.value
  }
}
