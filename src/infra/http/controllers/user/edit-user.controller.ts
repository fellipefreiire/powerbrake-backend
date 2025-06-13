import {
  Body,
  Controller,
  HttpCode,
  Param,
  Patch,
  UseFilters,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { EditUserUseCase } from '@/domain/user/application/use-cases/edit-user'
import { CaslAbilityGuard } from '@/infra/auth/casl/casl-ability.guard'
import { CheckPolicies } from '@/infra/auth/casl/check-policies.decorator'
import { UserPresenter } from '../../presenters/user.presenter'
import { z } from 'zod'
import { ServiceTag } from '@/infra/decorators/service-tag.decorator'
import { UserErrorFilter } from '../../filters/user-error.filter'
import { EditUserRequestDto } from '../../dtos/requests/user'
import {
  BadRequestDto,
  InternalServerErrorDto,
  UnprocessableEntityDto,
} from '../../dtos/error/generic'
import {
  UserNotFoundDto,
  UserForbiddenDto,
  WrongCredentialsDto,
} from '../../dtos/error/user'
import { UserResponseDto } from '../../dtos/response/user'
import { ParseUuidPipe, ZodValidationPipe } from '../../pipes'
import { userCanUpdateSelfHandler } from '@/infra/auth/casl/handlers/user-can-update-self.handler'

const editUserBodySchema = z.object({
  name: z.string().optional(),
  addresses: z
    .array(
      z.object({
        street: z.string(),
        number: z.string(),
        complement: z.string().nullish(),
        neighborhood: z.string(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string(),
      }),
    )
    .optional(),
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
  @CheckPolicies(userCanUpdateSelfHandler)
  @HttpCode(200)
  @ApiOperation({ summary: 'Edit user' })
  @ApiBody({ type: EditUserRequestDto })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiUnauthorizedResponse({ type: WrongCredentialsDto })
  @ApiForbiddenResponse({ type: UserForbiddenDto })
  @ApiNotFoundResponse({ type: UserNotFoundDto })
  @ApiUnprocessableEntityResponse({ type: UnprocessableEntityDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  async handle(
    @Param('id', ParseUuidPipe) id: string,
    @Body(new ZodValidationPipe(editUserBodySchema)) body: EditUserBodySchema,
  ) {
    const result = await this.editUserUseCase.execute({ id, ...body })

    if (result.isLeft()) throw result.value

    const user = result.value.data

    return {
      data: UserPresenter.toHTTP(user),
    }
  }
}
