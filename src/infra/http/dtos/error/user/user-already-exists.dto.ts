import { ApiProperty } from '@nestjs/swagger'
import { ConflictDto } from '../generic/conflict.dto'

export class UserAlreadyExistsDto extends ConflictDto {
  @ApiProperty({ example: 'User already exists.' })
  declare message: string
}
