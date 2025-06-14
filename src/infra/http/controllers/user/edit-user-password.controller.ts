import {
  Body,
  Controller,
  HttpCode,
  Patch,
  UseFilters,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { z } from 'zod'

import { ZodValidationPipe } from '../../pipes/zod-validation.pipe'
import { CaslAbilityGuard } from '@/infra/auth/casl/casl-ability.guard'
import { CheckPolicies } from '@/infra/auth/casl/check-policies.decorator'
import { EditUserPasswordUseCase } from '@/domain/user/application/use-cases/edit-user-password'
import { UserErrorFilter } from '../../filters/user-error.filter'
import { ServiceTag } from '@/infra/decorators/service-tag.decorator'

import {
  BadRequestDto,
  InternalServerErrorDto,
  UnprocessableEntityDto,
} from '../../dtos/error/generic'
import { WrongCredentialsDto, UserNotFoundDto } from '../../dtos/error/user'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { EditUserPasswordRequestDto } from '../../dtos/requests/user'
import type { UserPayload } from '@/infra/auth/jwt.strategy'
import { userCanUpdateSelfHandler } from '@/infra/auth/casl/handlers/user-can-update-self.handler'
import { sanitize } from '@/shared/utils/sanitize-html'

const editUserPasswordBodySchema = z.object({
  currentPassword: z
    .string()
    .min(8)
    .transform((val) => sanitize(val)),
  newPassword: z
    .string()
    .min(8)
    .transform((val) => sanitize(val)),
})

type EditUserPasswordBody = z.infer<typeof editUserPasswordBodySchema>

@UseFilters(UserErrorFilter)
@ApiTags('Users')
@ServiceTag('user')
@Controller({ path: 'users', version: '1' })
export class EditUserPasswordController {
  constructor(private editUserPasswordUseCase: EditUserPasswordUseCase) {}

  @Patch(':id/password')
  @UseGuards(CaslAbilityGuard)
  @CheckPolicies(userCanUpdateSelfHandler)
  @HttpCode(204)
  @ApiOperation({ summary: 'Edit own password' })
  @ApiBody({ type: EditUserPasswordRequestDto })
  @ApiNoContentResponse({ description: 'Password updated successfully' })
  @ApiNotFoundResponse({ type: UserNotFoundDto })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiUnauthorizedResponse({ type: WrongCredentialsDto })
  @ApiUnprocessableEntityResponse({ type: UnprocessableEntityDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(editUserPasswordBodySchema))
    body: EditUserPasswordBody,
  ) {
    const { currentPassword, newPassword } = body

    const result = await this.editUserPasswordUseCase.execute({
      userId: user.sub,
      currentPassword,
      newPassword,
      currentJti: user.jti,
    })

    if (result.isLeft()) {
      throw result.value
    }
  }
}
