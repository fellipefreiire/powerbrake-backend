import { ApiProperty } from '@nestjs/swagger'

class TokenDataDto {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT válido para autenticação.',
  })
  token: string

  @ApiProperty({
    example: 1723487384,
    description: 'Data de expiração do token (timestamp UNIX).',
  })
  expiresIn: number
}

export class RefreshTokenResponseDto {
  @ApiProperty({ type: () => TokenDataDto })
  access_token: TokenDataDto

  @ApiProperty({ type: () => TokenDataDto })
  refresh_token: TokenDataDto

  @ApiProperty({
    example: 1723487384,
    description: 'Timestamp da expiração do access token (redundante).',
  })
  expiresIn: number
}
