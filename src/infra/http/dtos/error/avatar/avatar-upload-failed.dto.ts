import { ApiProperty } from '@nestjs/swagger'
import { InternalServerErrorDto } from '../generic'

export class AvatarUploadFailedDto extends InternalServerErrorDto {
  @ApiProperty({ example: 'Failed to upload avatar' })
  declare message: string
}
