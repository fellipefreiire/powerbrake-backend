import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Role } from '@prisma/client'

export class UserResponseDto {
  @ApiProperty({ example: '855c4f19-38e5-4b73-932e-9e3fb6eafe30' })
  id!: string

  @ApiProperty({ example: 'John Doe' })
  name!: string

  @ApiProperty({ example: 'john.doe@email.com' })
  email!: string

  @ApiProperty({ enum: Role, example: Role.ADMIN })
  role!: Role

  @ApiProperty({ example: true })
  isActive!: boolean

  @ApiPropertyOptional({
    example: 'https://cdn.powerbrake.io/avatars/855c4f19.png',
  })
  avatarUrl?: string | null

  @ApiProperty({ example: '2025-06-04T01:42:11.123Z' })
  createdAt!: string

  @ApiPropertyOptional({ example: '2025-06-04T01:42:11.123Z' })
  updatedAt?: string | null
}
