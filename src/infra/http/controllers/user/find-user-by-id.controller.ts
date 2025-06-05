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
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { CaslAbilityGuard } from '@/infra/auth/casl/casl-ability.guard'
import { CheckPolicies } from '@/infra/auth/casl/check-policies.decorator'
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
import { userCanReadSelfHandler } from '@/infra/auth/casl/handlers/user-can-read-self.handler'

@UseFilters(UserErrorFilter)
@ApiTags('Users')
@ServiceTag('user')
@Controller({ path: 'users', version: '1' })
export class FindUserByIdController {
  constructor(private findUserByIdUseCase: FindUserByIdUseCase) {}

  @UseGuards(CaslAbilityGuard)
  @CheckPolicies(userCanReadSelfHandler)
  @Get(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Find user by id' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiUnauthorizedResponse({ type: WrongCredentialsDto })
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
