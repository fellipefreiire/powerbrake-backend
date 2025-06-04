import { ApiProperty } from '@nestjs/swagger'

export class ForbiddenDto {
  @ApiProperty({ example: 403 })
  declare statusCode: number

  @ApiProperty({ example: 'Forbidden' })
  declare error: string

  @ApiProperty({ example: 'You do not have permission to perform this action' })
  declare message: string | string[]
}
