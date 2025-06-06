import {
  Controller,
  HttpCode,
  Post,
  UseGuards,
  UseFilters,
} from '@nestjs/common'
import { LogoutUserUseCase } from '@/domain/user/application/use-cases/logout-user'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { UserErrorFilter } from '../../filters/user-error.filter'
import type { RefreshTokenPayload } from '@/infra/auth/jwt.strategy'
import {
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { InternalServerErrorDto } from '../../dtos/error/generic'
import { UserUnauthorizedDto } from '../../dtos/error/user'
import { ServiceTag } from '@/infra/decorators/service-tag.decorator'

@UseFilters(UserErrorFilter)
@ApiTags('Users')
@ServiceTag('user')
@Controller({ path: 'users', version: '1' })
export class LogoutUserController {
  constructor(private logoutUser: LogoutUserUseCase) {}

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user by invalidating refresh token' })
  @ApiNoContentResponse({ description: 'User logged out successfully' })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
    type: UserUnauthorizedDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error',
    type: InternalServerErrorDto,
  })
  async handle(@CurrentUser() user: RefreshTokenPayload) {
    const result = await this.logoutUser.execute({ jti: user.jti })

    if (result.isLeft()) throw result.value
  }
}
