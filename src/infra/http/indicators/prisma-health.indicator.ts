import { Injectable } from '@nestjs/common'
import { type HealthIndicatorResult } from '@nestjs/terminus'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

@Injectable()
export class PrismaHealthIndicator {
  constructor(private prisma: PrismaService) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRawUnsafe('SELECT 1')
      return {
        [key]: {
          status: 'up',
        },
      }
    } catch {
      return {
        [key]: {
          status: 'down',
        },
      }
    }
  }
}
