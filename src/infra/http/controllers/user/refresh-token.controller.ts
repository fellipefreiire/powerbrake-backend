import { Controller, Post, Headers, UseFilters, HttpCode } from '@nestjs/common'
import { Public } from '@/infra/auth/public'
import { UserErrorFilter } from '../../filters/user-error.filter'
import {
  ApiBadRequestResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { ServiceTag } from '@/infra/decorators/service-tag.decorator'
import { RefreshUserTokenUseCase } from '@/domain/user/application/use-cases/refresh-user-token'
import { BadRequestDto, InternalServerErrorDto } from '../../dtos/error/generic'
import { WrongCredentialsDto } from '../../dtos/error/user'
import { RefreshTokenResponseDto } from '../../dtos/response/user'

@UseFilters(UserErrorFilter)
@ApiTags('Users')
@ServiceTag('user')
@Public()
@Controller({ path: 'users', version: '1' })
export class RefreshTokenController {
  constructor(private refreshUserToken: RefreshUserTokenUseCase) {}

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Renews the access token using a valid refresh token. The refresh token must be passed in the `Authorization` header.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer {refresh_token}',
  })
  @ApiOkResponse({
    description: 'New access token issued',
    type: RefreshTokenResponseDto,
  })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiUnauthorizedResponse({ type: WrongCredentialsDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  async handle(@Headers('authorization') authHeader: string) {
    const refreshToken = authHeader?.replace('Bearer ', '')

    const result = await this.refreshUserToken.execute({ refreshToken })

    if (result.isLeft()) {
      throw result.value
    }

    return {
      access_token: result.value.accessToken,
      refresh_token: result.value.refreshToken,
      expiresIn: result.value.expiresIn,
    }
  }
}
