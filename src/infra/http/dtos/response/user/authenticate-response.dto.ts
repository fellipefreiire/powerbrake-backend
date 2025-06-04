import { ApiProperty } from '@nestjs/swagger'

export class AuthenticateUserResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...' })
  access_token!: string

  @ApiProperty({ example: 3600 })
  expiresIn!: number
}
