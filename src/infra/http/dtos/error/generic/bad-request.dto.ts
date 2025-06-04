import { ApiProperty } from '@nestjs/swagger'

export class BadRequestDto {
  @ApiProperty({ example: 400 })
  declare statusCode: number

  @ApiProperty({ example: 'Bad Request' })
  declare error: string

  @ApiProperty({ example: 'Invalid parameters' })
  declare message: string | string[]
}
