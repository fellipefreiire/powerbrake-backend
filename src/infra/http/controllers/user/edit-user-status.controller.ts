import {
  Controller,
  HttpCode,
  Param,
  Patch,
  UseFilters,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { CaslAbilityGuard } from '@/infra/auth/casl/casl-ability.guard'
import { CheckPolicies } from '@/infra/auth/casl/check-policies.decorator'
import { UserPresenter } from '../../presenters/user.presenter'
import { EditUserStatusUseCase } from '@/domain/user/application/use-cases/edit-user-status'
import { ServiceTag } from '@/infra/decorators/service-tag.decorator'
import { UserErrorFilter } from '../../filters/user-error.filter'
import { ParseUuidPipe } from '../../pipes/parse-uuid.pipe'
import { UserResponseDto } from '../../dtos/response/user'
import { BadRequestDto, InternalServerErrorDto } from '../../dtos/error/generic'
import {
  UserForbiddenDto,
  UserNotFoundDto,
  WrongCredentialsDto,
} from '../../dtos/error/user'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import type { UserPayload } from '@/infra/auth/jwt.strategy'

@UseFilters(UserErrorFilter)
@ApiTags('Users')
@ServiceTag('user')
@Controller({ path: 'users', version: '1' })
export class EditUserStatusController {
  constructor(private editUserStatusUseCase: EditUserStatusUseCase) {}

  @UseGuards(CaslAbilityGuard)
  @CheckPolicies(
    (ability) =>
      ability.can('activate', 'User') && ability.can('deactivate', 'User'),
  )
  @Patch(':id/status')
  @HttpCode(200)
  @ApiOperation({ summary: 'Edit user status' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiUnauthorizedResponse({ type: WrongCredentialsDto })
  @ApiForbiddenResponse({ type: UserForbiddenDto })
  @ApiNotFoundResponse({ type: UserNotFoundDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  async handle(
    @CurrentUser() currentUser: UserPayload,
    @Param('id', ParseUuidPipe) id: string,
  ) {
    const result = await this.editUserStatusUseCase.execute({
      id,
      actorId: currentUser.sub,
    })

    if (result.isLeft()) {
      throw result.value
    }

    const user = result.value.data

    return {
      data: UserPresenter.toHTTP(user),
    }
  }
}
