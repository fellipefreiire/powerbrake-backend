import { ApiProperty } from '@nestjs/swagger'

export class TooManyRequestsDto {
  @ApiProperty({ example: 429 })
  declare statusCode: number

  @ApiProperty({ example: 'Too Many Requests' })
  declare error: string

  @ApiProperty({ example: 'Rate limit exceeded' })
  declare message: string | string[]
}
