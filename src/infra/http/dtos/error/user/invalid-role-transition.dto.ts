import { ApiProperty } from '@nestjs/swagger'
import { ForbiddenDto } from '../generic/forbidden.dto'

export class InvalidRoleTransitionDto extends ForbiddenDto {
  @ApiProperty({ example: 'Cannot change role from OPERATOR to ADMIN' })
  declare message: string
}
