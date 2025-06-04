import { ApiProperty } from '@nestjs/swagger'
import { ForbiddenDto } from '../generic'

export class UserForbiddenDto extends ForbiddenDto {
  @ApiProperty({ example: 'Access Denied' })
  declare message: string
}
