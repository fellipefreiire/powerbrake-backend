import { ApiProperty } from '@nestjs/swagger'
import { UnauthorizedDto } from '../generic'

export class WrongCredentialsDto extends UnauthorizedDto {
  @ApiProperty({ example: 'Credentials are not valid.' })
  declare message: string
}
