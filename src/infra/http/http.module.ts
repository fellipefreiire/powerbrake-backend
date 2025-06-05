import { Module } from '@nestjs/common'
import { UserControllersModule } from './controllers/user/user-controllers.module'
import { AvatarControllersModule } from './controllers/avatar/avatar-controllers.module'
import { TerminusModule } from '@nestjs/terminus'
import { HealthController } from './controllers/health.controller'
import { PrismaHealthIndicator } from './indicators/prisma-health.indicator'
import { RedisHealthIndicator } from './indicators/redis-health.indicator'
import { S3HealthIndicator } from './indicators/s3-health.indicator'
import { PrismaModule } from '../database/prisma/prisma.module'
import { CacheModule } from '../cache/cache.module'
import { StorageModule } from '../storage/storage.module'

@Module({
  imports: [
    UserControllersModule,
    AvatarControllersModule,
    TerminusModule,
    PrismaModule,
    CacheModule,
    StorageModule,
  ],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator, RedisHealthIndicator, S3HealthIndicator],
})
export class HttpModule {}
