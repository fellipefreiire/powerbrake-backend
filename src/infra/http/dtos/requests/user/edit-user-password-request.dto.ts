import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

export class EditUserPasswordRequestDto {
  @ApiProperty({
    example: 'current-password123',
    description: 'The current password of the user',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  currentPassword: string

  @ApiProperty({
    example: 'new-password456',
    description: 'The new password to be set',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword: string
}
