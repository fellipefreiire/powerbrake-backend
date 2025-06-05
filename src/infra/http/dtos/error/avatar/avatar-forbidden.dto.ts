import { ApiProperty } from '@nestjs/swagger'
import { ForbiddenDto } from '../generic'

export class AvatarForbiddenDto extends ForbiddenDto {
  @ApiProperty({ example: 'You are not allowed to perform this action.' })
  declare message: string
}
