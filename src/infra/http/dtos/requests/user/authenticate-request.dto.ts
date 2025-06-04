import { ApiProperty } from '@nestjs/swagger'

export class AuthenticateUserRequestDto {
  @ApiProperty({ example: 'john@email.com' })
  email!: string

  @ApiProperty({ example: 'mySecurePass123' })
  password!: string
}
