import { ApiProperty } from '@nestjs/swagger'

export class InternalServerErrorDto {
  @ApiProperty({ example: 500 })
  declare statusCode: number

  @ApiProperty({ example: 'Internal server error' })
  declare error: string

  @ApiProperty({ example: 'Internal server error' })
  declare message: string | string[]
}
