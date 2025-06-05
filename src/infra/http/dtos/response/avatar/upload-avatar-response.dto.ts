import { ApiProperty } from '@nestjs/swagger'

export class UploadAvatarResponseDto {
  @ApiProperty({
    example: 'avatar-uuid-123',
    description: 'ID of the uploaded avatar',
  })
  data: string
}
