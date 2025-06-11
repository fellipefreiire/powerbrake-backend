import { ApiProperty } from '@nestjs/swagger'
import { ActorType } from '@prisma/client'

class AuditLogActorDto {
  @ApiProperty({ example: 'usr_123456' })
  id: string

  @ApiProperty({ enum: ActorType, example: ActorType.USER })
  type: ActorType

  @ApiProperty({ example: 'João Silva' })
  name: string

  @ApiProperty({ example: 'joao@empresa.com' })
  email: string
}

class AuditLogDto {
  @ApiProperty({ example: 'log_abc123' })
  id: string

  @ApiProperty({ type: () => AuditLogActorDto })
  actor: AuditLogActorDto

  @ApiProperty({ example: 'edit' })
  action: string

  @ApiProperty({ example: 'User' })
  entity: string

  @ApiProperty({ example: 'usr_789456' })
  entityId: string

  @ApiProperty({
    example: { name: ['João', 'João Silva'] },
    nullable: true,
  })
  changes: Record<string, unknown> | null

  @ApiProperty({ example: '2025-06-11T19:00:00.000Z' })
  createdAt: Date
}

class PaginationMetaDto {
  @ApiProperty({ example: 20 })
  count: number

  @ApiProperty({ example: true })
  hasNextPage: boolean

  @ApiProperty({ example: 'log_abcdef123456', nullable: true })
  nextCursor?: string | null
}

export class AuditLogListResponseDto {
  @ApiProperty({ type: () => [AuditLogDto] })
  data: AuditLogDto[]

  @ApiProperty({ type: () => PaginationMetaDto })
  meta: PaginationMetaDto
}
