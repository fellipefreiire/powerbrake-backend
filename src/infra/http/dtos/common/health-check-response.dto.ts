import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class HealthDetailDto {
  @ApiProperty({
    example: 'up',
    enum: ['up', 'down'],
    description: 'Status do componente verificado.',
  })
  status: 'up' | 'down'

  @ApiPropertyOptional({
    example: 'Serviço está operacional',
    description: 'Mensagem adicional sobre o status (opcional).',
  })
  message?: string
}

export class HealthComponentsDto {
  @ApiProperty({
    type: () => HealthDetailDto,
    description: 'Status do banco de dados.',
  }) // Usar arrow function para evitar problemas de referência circular/inicialização
  database: HealthDetailDto

  @ApiProperty({ type: () => HealthDetailDto, description: 'Status do Redis.' })
  redis: HealthDetailDto

  @ApiProperty({
    type: () => HealthDetailDto,
    description: 'Status do S3 (armazenamento de objetos).',
  })
  s3: HealthDetailDto
}

export class HealthCheckResponseDto {
  @ApiProperty({
    example: 'ok',
    enum: ['ok', 'error'],
    description: 'Status geral do health check.',
  })
  status: 'ok' | 'error'

  @ApiPropertyOptional({
    type: () => HealthComponentsDto,
    description:
      'Informações detalhadas dos componentes quando o status geral é "ok".',
  })
  info?: HealthComponentsDto

  @ApiPropertyOptional({
    type: () => HealthComponentsDto,
    description:
      'Informações detalhadas dos componentes quando o status geral é "error".',
  })
  error?: HealthComponentsDto

  @ApiProperty({
    type: () => HealthComponentsDto,
    description: 'Detalhes brutos de todos os componentes verificados.',
  })
  details: HealthComponentsDto
}
