import { AuthenticateUserUseCase } from '@/domain/user/application/use-cases/authenticate-user'
import { Public } from '@/infra/auth/public'
import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseFilters,
  UseGuards,
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
import { RateLimit } from '@/shared/rate-limit/rate-limit.decorator'
import { RateLimitGuard } from '@/shared/rate-limit/rate-limit.guard'
import { sanitize } from '@/shared/utils/sanitize-html'

const authenticateBodySchema = z.object({
  email: z
    .string()
    .email()
    .transform((val) => sanitize(val)),
  password: z.string().transform((val) => sanitize(val)),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@UseFilters(UserErrorFilter)
@ApiTags('Users')
@ServiceTag('user')
@Public()
@Controller({ path: 'users', version: '1' })
export class AuthenticateUserController {
  constructor(private authenticateUser: AuthenticateUserUseCase) {}

  @Post('login')
  @UseGuards(RateLimitGuard)
  @RateLimit(5, 60)
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
      refresh_token: result.value.refreshToken,
      expiresIn: result.value.expiresIn,
    }
  }
}
