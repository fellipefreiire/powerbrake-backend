import { ApiProperty } from '@nestjs/swagger'

export class ForgotPasswordRequestDto {
  @ApiProperty({
    type: String,
    example: 'user@example.com',
    description: 'E-mail do usuário para recuperar a senha',
  })
  email!: string
}
