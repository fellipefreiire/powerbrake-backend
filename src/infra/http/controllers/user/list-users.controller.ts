import {
  BadRequestException,
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
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe'
import { ListUsersUseCase } from '@/domain/user/application/use-cases/list-users'
import { CaslAbilityGuard } from '@/infra/auth/casl/casl-ability.guard'
import { CheckPolicies } from '@/infra/auth/casl/check-policies.decorator'
import { ServiceTag } from '@/infra/decorators/service-tag.decorator'
import { UserErrorFilter } from '../../filters/user-error.filter'
import { BadRequestDto, InternalServerErrorDto } from '../../dtos/error/generic'
import { UserResponseDto } from '../../dtos/response/user'
import { UserForbiddenDto, WrongCredentialsDto } from '../../dtos/error/user'

const querySchema = z.object({
  page: z.coerce.number().optional().default(1),
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
  @ApiOkResponse({ type: [UserResponseDto] })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiUnauthorizedResponse({ type: WrongCredentialsDto })
  @ApiForbiddenResponse({ type: UserForbiddenDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  async handle(
    @Query(new ZodValidationPipe(querySchema)) { page }: QuerySchema,
  ) {
    const result = await this.listUsersUseCase.execute({ page })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const user = result.value.data

    return {
      data: user.map(UserPresenter.toHTTP),
    }
  }
}
