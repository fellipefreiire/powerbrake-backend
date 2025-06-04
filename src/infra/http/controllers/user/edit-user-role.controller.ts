import {
  Body,
  Controller,
  HttpCode,
  Param,
  Patch,
  UseFilters,
  UseGuards,
  UsePipes,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { CaslAbilityGuard } from '@/infra/auth/casl/casl-ability.guard'
import { CheckPolicies } from '@/infra/auth/casl/check-policies.decorator'
import { UserPresenter } from '../../presenters/user.presenter'
import { z } from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe'
import { EditUserRoleUseCase } from '@/domain/user/application/use-cases/edit-user-role'
import { roleSchema } from '@/infra/auth/casl/roles'
import { ServiceTag } from '@/infra/decorators/service-tag.decorator'
import { UserErrorFilter } from '../../filters/user-error.filter'
import { ParseUuidPipe } from '../../pipes/parse-uuid.pipe'
import { UserResponseDto } from '../../dtos/response/user'
import {
  BadRequestDto,
  InternalServerErrorDto,
  UnprocessableEntityDto,
} from '../../dtos/error/generic'
import {
  InvalidRoleTransitionDto,
  UserNotFoundDto,
} from '../../dtos/error/user'
import { EditUserRoleRequestDto } from '../../dtos/requests/user'

const editUserRoleBodySchema = z.object({
  role: roleSchema,
})

type EditUserRoleBodySchema = z.infer<typeof editUserRoleBodySchema>

@UseFilters(UserErrorFilter)
@ApiTags('Users')
@ServiceTag('user')
@Controller({ path: 'users/role', version: '1' })
export class EditUserRoleController {
  constructor(private editUserRoleUseCase: EditUserRoleUseCase) {}

  @Patch(':id')
  @UseGuards(CaslAbilityGuard)
  @CheckPolicies((ability) => ability.can('update', 'User'))
  @HttpCode(200)
  @ApiBody({ type: EditUserRoleRequestDto })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiForbiddenResponse({ type: InvalidRoleTransitionDto })
  @ApiNotFoundResponse({ type: UserNotFoundDto })
  @ApiUnprocessableEntityResponse({ type: UnprocessableEntityDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  @UsePipes(new ZodValidationPipe(editUserRoleBodySchema))
  async handle(
    @Param('id', ParseUuidPipe) id: string,
    @Body() body: EditUserRoleBodySchema,
  ) {
    const { role } = body

    const result = await this.editUserRoleUseCase.execute({
      id,
      role,
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
