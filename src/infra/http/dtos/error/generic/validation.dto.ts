import { ApiProperty } from '@nestjs/swagger'

export class ValidationErrorDto {
  @ApiProperty({ example: 400 })
  declare statusCode: number

  @ApiProperty({ example: 'BadRequest' })
  declare error: string

  @ApiProperty({
    example: [
      { path: 'email', message: 'E-mail must be valid' },
      { path: 'password', message: 'Minimum length is 6' },
    ],
  })
  declare message: string | string[]
}
