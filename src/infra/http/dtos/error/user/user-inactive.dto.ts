import { ApiProperty } from '@nestjs/swagger'
import { ForbiddenDto } from '../generic/forbidden.dto'

export class UserInactiveDto extends ForbiddenDto {
  @ApiProperty({ example: 'User is inactive' })
  declare message: string
}
