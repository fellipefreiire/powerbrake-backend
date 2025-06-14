import {
  Controller,
  Post,
  Body,
  HttpCode,
  UsePipes,
  UseFilters,
  UseGuards,
} from '@nestjs/common'
import { ForgotPasswordUseCase } from '@/domain/user/application/use-cases/forgot-password'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import { UserErrorFilter } from '../../filters/user-error.filter'
import {
  ApiTags,
  ApiOperation,
  ApiNoContentResponse,
  ApiBody,
} from '@nestjs/swagger'
import { ServiceTag } from '@/infra/decorators/service-tag.decorator'
import { ForgotPasswordRequestDto } from '../../dtos/requests/user'
import { z } from 'zod'
import { EnvService } from '@/infra/env/env.service'
import { Public } from '@/infra/auth/public'
import { RateLimit } from '@/shared/rate-limit/rate-limit.decorator'
import { RateLimitGuard } from '@/shared/rate-limit/rate-limit.guard'
import { sanitize } from '@/shared/utils/sanitize-html'

const forgotPasswordBodySchema = z.object({
  email: z
    .string()
    .email()
    .transform((val) => sanitize(val)),
})

type ForgotPasswordBodySchema = z.infer<typeof forgotPasswordBodySchema>

@ApiTags('Users')
@ServiceTag('user')
@UseFilters(UserErrorFilter)
@Public()
@Controller({ path: 'users', version: '1' })
export class ForgotPasswordController {
  constructor(
    private forgotPasswordUseCase: ForgotPasswordUseCase,
    private env: EnvService,
  ) {}

  @Post('forgot-password')
  @UseGuards(RateLimitGuard)
  @RateLimit(3, 60)
  @HttpCode(204)
  @UsePipes(new ZodValidationPipe(forgotPasswordBodySchema))
  @ApiOperation({ summary: 'Solicitar redefinição de senha' })
  @ApiNoContentResponse({ description: 'Token enviado por e-mail' })
  @ApiBody({ type: ForgotPasswordRequestDto })
  async handle(@Body() body: ForgotPasswordBodySchema) {
    const baseUrl = this.env.get('RESET_PASSWORD_URL')
    const result = await this.forgotPasswordUseCase.execute({
      email: body.email,
      resetPasswordUrl: baseUrl,
    })

    if (result.isLeft()) {
      throw result.value
    }
  }
}
