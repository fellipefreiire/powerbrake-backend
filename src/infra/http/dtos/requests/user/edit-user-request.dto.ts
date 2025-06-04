// edit-user-request.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class EditUserRequestDto {
  @ApiProperty({ example: 'John Updated' })
  name!: string

  @ApiPropertyOptional({
    example: '6be7aab9-30a7-4fc8-b22a-4a25e3d7d4b4',
    description: 'Avatar ID existente',
  })
  avatarId?: string
}
