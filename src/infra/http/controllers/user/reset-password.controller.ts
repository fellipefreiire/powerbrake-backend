import {
  Controller,
  Post,
  Body,
  HttpCode,
  UsePipes,
  UseFilters,
  UseGuards,
} from '@nestjs/common'
import { ResetPasswordUseCase } from '@/domain/user/application/use-cases/reset-password'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import { UserErrorFilter } from '../../filters/user-error.filter'
import {
  ApiTags,
  ApiOperation,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiBody,
} from '@nestjs/swagger'
import { ServiceTag } from '@/infra/decorators/service-tag.decorator'
import { z } from 'zod'
import { Public } from '@/infra/auth/public'
import { ResetPasswordRequestDto } from '../../dtos/requests/user'
import { RateLimit } from '@/shared/rate-limit/rate-limit.decorator'
import { RateLimitGuard } from '@/shared/rate-limit/rate-limit.guard'

export const resetPasswordBodySchema = z.object({
  token: z.string().nonempty(),
  password: z.string().min(8),
})

export type ResetPasswordBodySchema = z.infer<typeof resetPasswordBodySchema>

@ApiTags('Users')
@ServiceTag('user')
@UseFilters(UserErrorFilter)
@Public()
@Controller({ path: 'users', version: '1' })
export class ResetPasswordController {
  constructor(private resetPasswordUseCase: ResetPasswordUseCase) {}

  @Post('reset-password')
  @UseGuards(RateLimitGuard)
  @RateLimit(3, 60)
  @HttpCode(204)
  @UsePipes(new ZodValidationPipe(resetPasswordBodySchema))
  @ApiOperation({ summary: 'Reset user password using token' })
  @ApiNoContentResponse({ description: 'Password reset successfully' })
  @ApiBadRequestResponse({ description: 'Invalid token or data' })
  @ApiBody({ type: ResetPasswordRequestDto })
  async handle(@Body() body: { token: string; password: string }) {
    const result = await this.resetPasswordUseCase.execute(body)

    if (result.isLeft()) {
      throw result.value
    }
  }
}
