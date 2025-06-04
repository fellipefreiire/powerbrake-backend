import { ApiProperty } from '@nestjs/swagger'
import { Role } from '@prisma/client'

export class EditUserRoleRequestDto {
  @ApiProperty({
    enum: Role,
    example: Role.ADMIN,
    description: 'Novo cargo do usuário',
  })
  role!: Role
}
