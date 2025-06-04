import { ApiProperty } from '@nestjs/swagger'
import { Role } from '@prisma/client'

export class CreateUserRequestDto {
  @ApiProperty({ example: 'John Doe' })
  name!: string

  @ApiProperty({ example: 'john.doe@email.com' })
  email!: string

  @ApiProperty({ example: 'MySecurePass123!' })
  password!: string

  @ApiProperty({ enum: Role, example: Role.ADMIN })
  role!: Role
}
