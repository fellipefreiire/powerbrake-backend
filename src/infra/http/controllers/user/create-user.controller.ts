import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseFilters,
  UseGuards,
  UsePipes,
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

const createUserBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
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
  @ApiBody({ type: CreateUserRequestDto })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiUnauthorizedResponse({ type: WrongCredentialsDto })
  @ApiForbiddenResponse({ type: UserForbiddenDto })
  @ApiConflictResponse({ type: UserAlreadyExistsDto })
  @ApiUnprocessableEntityResponse({ type: UnprocessableEntityDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  @UsePipes(new ZodValidationPipe(createUserBodySchema))
  async handle(@Body() body: CreateUserBodySchema) {
    const result = await this.createUserUseCase.execute(body)

    if (result.isLeft()) {
      throw result.value
    }

    const user = result.value.data

    return {
      data: UserPresenter.toHTTP(user),
    }
  }
}
