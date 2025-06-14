import { Module } from '@nestjs/common'
import { RateLimitService } from './rate-limit.service'
import { CacheModule } from '@/infra/cache/cache.module'
import { EnvModule } from '@/infra/env/env.module'

@Module({
  imports: [CacheModule, EnvModule],
  providers: [RateLimitService, CacheModule],
  exports: [RateLimitService],
})
export class RateLimitModule {}
