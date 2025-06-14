import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common'
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe'
import { z } from 'zod'
import { CreateUserUseCase } from '@/domain/user/application/use-cases/create-user'
import { UserPresenter } from '../../presenters/user.presenter'
import { Role } from '@prisma/client'
import { CheckPolicies } from '@/infra/auth/casl/check-policies.decorator'
import { CaslAbilityGuard } from '@/infra/auth/casl/casl-ability.guard'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { ServiceTag } from '@/infra/decorators/service-tag.decorator'
import { UserErrorFilter } from '../../filters/user-error.filter'
import {
  BadRequestDto,
  InternalServerErrorDto,
  UnprocessableEntityDto,
} from '../../dtos/error/generic'
import {
  UserAlreadyExistsDto,
  UserForbiddenDto,
  WrongCredentialsDto,
} from '../../dtos/error/user'
import { UserResponseDto } from '../../dtos/response/user'
import { CreateUserRequestDto } from '../../dtos/requests/user'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import type { UserPayload } from '@/infra/auth/jwt.strategy'
import { sanitize } from '@/shared/utils/sanitize-html'

const createUserBodySchema = z.object({
  name: z.string().transform((val) => sanitize(val)),
  email: z
    .string()
    .email()
    .transform((val) => sanitize(val)),
  password: z.string().transform((val) => sanitize(val)),
  addresses: z.array(
    z.object({
      street: z.string().transform((val) => sanitize(val)),
      number: z.string().transform((val) => sanitize(val)),
      complement: z
        .string()
        .nullish()
        .transform((val) => (val ? sanitize(val) : val)),
      neighborhood: z.string().transform((val) => sanitize(val)),
      city: z.string().transform((val) => sanitize(val)),
      state: z.string().transform((val) => sanitize(val)),
      zipCode: z.string().transform((val) => sanitize(val)),
    }),
  ),
  role: z.nativeEnum(Role),
})

type CreateUserBodySchema = z.infer<typeof createUserBodySchema>

@UseFilters(UserErrorFilter)
@ApiTags('Users')
@ServiceTag('user')
@Controller({ path: 'users', version: '1' })
export class CreateUserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  @UseGuards(CaslAbilityGuard)
  @CheckPolicies((ability) => ability.can('create', 'User'))
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: CreateUserRequestDto })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiUnauthorizedResponse({ type: WrongCredentialsDto })
  @ApiForbiddenResponse({ type: UserForbiddenDto })
  @ApiConflictResponse({ type: UserAlreadyExistsDto })
  @ApiUnprocessableEntityResponse({ type: UnprocessableEntityDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  async handle(
    @CurrentUser() currentUser: UserPayload,
    @Body(new ZodValidationPipe(createUserBodySchema))
    body: CreateUserBodySchema,
  ) {
    const result = await this.createUserUseCase.execute({
      actorId: currentUser.sub,
      ...body,
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
