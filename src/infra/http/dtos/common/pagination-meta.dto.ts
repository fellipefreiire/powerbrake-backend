import { ApiProperty } from '@nestjs/swagger'

export class PaginationMetaDto {
  @ApiProperty({ example: 25 })
  total!: number

  @ApiProperty({ example: 10 })
  count!: number

  @ApiProperty({ example: 10 })
  perPage!: number

  @ApiProperty({ example: 3 })
  totalPages!: number

  @ApiProperty({ example: 2 })
  currentPage!: number

  @ApiProperty({ example: 3, nullable: true })
  nextPage!: number | null

  @ApiProperty({ example: 1, nullable: true })
  previousPage!: number | null
}
