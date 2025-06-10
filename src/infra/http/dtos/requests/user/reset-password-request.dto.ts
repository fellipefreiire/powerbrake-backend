import { ApiProperty } from '@nestjs/swagger'

export class ResetPasswordRequestDto {
  @ApiProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token enviado por e-mail para resetar a senha',
  })
  token!: string

  @ApiProperty({
    type: String,
    minLength: 8,
    example: 'NovaSenhaSegura123',
    description: 'Nova senha do usuário',
  })
  password!: string
}
