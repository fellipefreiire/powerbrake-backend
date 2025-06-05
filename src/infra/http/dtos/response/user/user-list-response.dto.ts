import { ApiProperty } from '@nestjs/swagger'
import { UserResponseDto } from './user-response.dto'
import { PaginationMetaDto } from '../../common'

export class UserListResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  data!: UserResponseDto[]

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto
}
