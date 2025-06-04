import {
  Controller,
  Get,
  HttpCode,
  Param,
  UseFilters,
  UseGuards,
} from '@nestjs/common'
import { UserPresenter } from '../../presenters/user.presenter'
import { FindUserByIdUseCase } from '@/domain/user/application/use-cases/find-user-by-id'
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CaslAbilityGuard } from '@/infra/auth/casl/casl-ability.guard'
import { CheckPolicies } from '@/infra/auth/casl/check-policies.decorator'
import { ServiceTag } from '@/infra/decorators/service-tag.decorator'
import { UserErrorFilter } from '../../filters/user-error.filter'
import { ParseUuidPipe } from '../../pipes/parse-uuid.pipe'
import { UserResponseDto } from '../../dtos/response/user'
import { BadRequestDto, InternalServerErrorDto } from '../../dtos/error/generic'
import { UserForbiddenDto, UserNotFoundDto } from '../../dtos/error/user'

@UseFilters(UserErrorFilter)
@ApiTags('Users')
@ServiceTag('user')
@Controller({ path: 'users', version: '1' })
export class FindUserByIdController {
  constructor(private findUserByIdUseCase: FindUserByIdUseCase) {}

  @UseGuards(CaslAbilityGuard)
  @CheckPolicies((ability) => ability.can('read', 'User'))
  @Get(':id')
  @HttpCode(200)
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiNotFoundResponse({ type: UserNotFoundDto })
  @ApiForbiddenResponse({ type: UserForbiddenDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  async handle(@Param('id', ParseUuidPipe) id: string) {
    const result = await this.findUserByIdUseCase.execute({ id })

    if (result.isLeft()) {
      throw result.value
    }

    const user = result.value.data

    return {
      data: UserPresenter.toHTTP(user),
    }
  }
}
