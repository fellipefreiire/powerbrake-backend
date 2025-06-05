import { AuthenticateUserUseCase } from '@/domain/user/application/use-cases/authenticate-user'
import { Public } from '@/infra/auth/public'
import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseFilters,
  UsePipes,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { ServiceTag } from '@/infra/decorators/service-tag.decorator'
import {
  BadRequestDto,
  InternalServerErrorDto,
  UnprocessableEntityDto,
} from '../../dtos/error/generic'
import { UserErrorFilter } from '../../filters/user-error.filter'
import { UserInactiveDto, WrongCredentialsDto } from '../../dtos/error/user'
import { AuthenticateUserRequestDto } from '../../dtos/requests/user'
import { AuthenticateUserResponseDto } from '../../dtos/response/user'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@UseFilters(UserErrorFilter)
@ApiTags('Users')
@ServiceTag('user')
@Controller({ path: 'users/login', version: '1' })
@Public()
export class AuthenticateUserController {
  constructor(private authenticateUser: AuthenticateUserUseCase) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Authenticate user' })
  @ApiBody({ type: AuthenticateUserRequestDto })
  @ApiOkResponse({
    description: 'Success',
    type: AuthenticateUserResponseDto,
  })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiUnauthorizedResponse({ type: WrongCredentialsDto })
  @ApiForbiddenResponse({ type: UserInactiveDto })
  @ApiUnprocessableEntityResponse({ type: UnprocessableEntityDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
    const { email, password } = body
    const result = await this.authenticateUser.execute({ email, password })

    if (result.isLeft()) throw result.value

    return {
      access_token: result.value.accessToken,
      expiresIn: result.value.expiresIn,
    }
  }
}
