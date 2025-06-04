import { ApiProperty } from '@nestjs/swagger'

export class ConflictDto {
  @ApiProperty({ example: 409 })
  declare statusCode: number

  @ApiProperty({ example: 'Conflict' })
  declare error: string

  @ApiProperty({ example: 'E-mail already in use' })
  declare message: string | string[]
}
