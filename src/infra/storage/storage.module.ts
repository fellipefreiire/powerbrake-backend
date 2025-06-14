import { LoggerRepository } from '../logger/winston/logger.repository'
import { Uploader } from '@/shared/storage/uploader'
import { Module } from '@nestjs/common'
import { EnvModule } from '../env/env.module'
import { R2Storage } from './r2/r2-storage'
import { LoggerModule } from '../logger/logger.module'
import { Logger } from 'winston'

@Module({
  imports: [EnvModule, LoggerModule],
  providers: [
    {
      provide: Uploader,
      useClass: R2Storage,
    },
    {
      provide: LoggerRepository,
      useClass: Logger,
    },
  ],
  exports: [Uploader],
})
export class StorageModule {}
