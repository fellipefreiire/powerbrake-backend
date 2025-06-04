import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env/env'
import { HttpModule } from './http/http.module'
import { AuthModule } from './auth/auth.module'
import { EnvModule } from './env/env.module'
import { LoggerModule } from './logger/logger.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    LoggerModule,
    AuthModule,
    HttpModule,
    EnvModule,
  ],
})
export class AppModule {}
