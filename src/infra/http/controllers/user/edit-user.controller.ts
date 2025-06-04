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
import { EditUserUseCase } from '@/domain/user/application/use-cases/edit-user'
import { CaslAbilityGuard } from '@/infra/auth/casl/casl-ability.guard'
import { CheckPolicies } from '@/infra/auth/casl/check-policies.decorator'
import { UserPresenter } from '../../presenters/user.presenter'
import { z } from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe'
import { ServiceTag } from '@/infra/decorators/service-tag.decorator'
import { UserErrorFilter } from '../../filters/user-error.filter'
import { EditUserRequestDto } from '../../dtos/requests/user'
import {
  BadRequestDto,
  InternalServerErrorDto,
  UnprocessableEntityDto,
} from '../../dtos/error/generic'
import { UserNotFoundDto, UserForbiddenDto } from '../../dtos/error/user'
import { UserResponseDto } from '../../dtos/response/user'
import { ParseUuidPipe } from '../../pipes/parse-uuid.pipe'

const editUserBodySchema = z.object({
  name: z.string().min(1),
  avatarId: z.string().uuid().optional(),
})

type EditUserBodySchema = z.infer<typeof editUserBodySchema>

@UseFilters(UserErrorFilter)
@ApiTags('Users')
@ServiceTag('user')
@Controller({ path: 'users', version: '1' })
export class EditUserController {
  constructor(private editUserUseCase: EditUserUseCase) {}

  @Patch(':id')
  @UseGuards(CaslAbilityGuard)
  @CheckPolicies((ability) => ability.can('update', 'User'))
  @HttpCode(200)
  @ApiBody({ type: EditUserRequestDto })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiForbiddenResponse({ type: UserForbiddenDto })
  @ApiNotFoundResponse({ type: UserNotFoundDto })
  @ApiUnprocessableEntityResponse({ type: UnprocessableEntityDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  @UsePipes(new ZodValidationPipe(editUserBodySchema))
  async handle(
    @Param('id', ParseUuidPipe) id: string,
    @Body() body: EditUserBodySchema,
  ) {
    const result = await this.editUserUseCase.execute({ id, ...body })

    if (result.isLeft()) throw result.value

    const user = result.value.data

    return {
      data: UserPresenter.toHTTP(user),
    }
  }
}
