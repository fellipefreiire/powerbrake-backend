import { ApiProperty } from '@nestjs/swagger'

export class UnauthorizedDto {
  @ApiProperty({ example: 401 })
  declare statusCode: number

  @ApiProperty({ example: 'Unauthorized' })
  declare error: string

  @ApiProperty({ example: 'Invalid credentials' })
  declare message: string | string[]
}
