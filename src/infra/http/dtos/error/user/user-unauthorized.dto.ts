import { ApiProperty } from '@nestjs/swagger'

export class UserUnauthorizedDto {
  @ApiProperty({
    example: 'UNAUTHORIZED',
    description: 'Error code',
  })
  code: string

  @ApiProperty({
    example: 'You must be logged in to access this resource.',
    description: 'Error message for unauthorized access',
  })
  message: string
}
