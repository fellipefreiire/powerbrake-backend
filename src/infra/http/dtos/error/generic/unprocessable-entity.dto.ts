import { ApiProperty } from '@nestjs/swagger'

export class UnprocessableEntityDto {
  @ApiProperty({ example: 422 })
  declare statusCode: number

  @ApiProperty({ example: 'Unprocessable Entity' })
  declare error: string

  @ApiProperty({ example: [{ path: 'email', message: 'Invalid e-mail' }] })
  declare message: string | string[]
}
