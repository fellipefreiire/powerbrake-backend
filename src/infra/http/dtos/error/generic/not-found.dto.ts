import { ApiProperty } from '@nestjs/swagger'

export class NotFoundDto {
  @ApiProperty({ example: 404 })
  declare statusCode: number

  @ApiProperty({ example: 'Not Found' })
  declare error: string

  @ApiProperty({ example: 'Resource not found' })
  declare message: string | string[]
}
