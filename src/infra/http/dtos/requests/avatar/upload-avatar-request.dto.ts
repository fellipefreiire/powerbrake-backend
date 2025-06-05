import { ApiProperty } from '@nestjs/swagger'

export class UploadAvatarRequestDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Avatar image file (JPG, PNG, JPEG)',
  })
  file: Express.Multer.File
}
