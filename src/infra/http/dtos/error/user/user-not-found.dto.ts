import { ApiProperty } from '@nestjs/swagger'
import { NotFoundDto } from '../generic/not-found.dto'

export class UserNotFoundDto extends NotFoundDto {
  @ApiProperty({ example: 'User not found' })
  declare message: string
}
