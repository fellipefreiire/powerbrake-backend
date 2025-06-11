import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './jwt.strategy'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './jwt-auth.guard'
import { EnvService } from '../env/env.service'
import { EnvModule } from '../env/env.module'
import { TokenService } from './token.service'
import { RefreshTokenService } from './refresh-token.service'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { CacheModule } from '../cache/cache.module'
import { RefreshTokenRepository } from './refresh-token.repository'
import { TokenRepository } from './token-repository'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      global: true,
      useFactory(env: EnvService) {
        const privateKey = env.get('JWT_PRIVATE_KEY')
        const publicKey = env.get('JWT_PUBLIC_KEY')

        return {
          signOptions: { algorithm: 'RS256' },
          privateKey: Buffer.from(privateKey, 'base64'),
          publicKey: Buffer.from(publicKey, 'base64'),
        }
      },
    }),
    CryptographyModule,
    CacheModule,
  ],
  providers: [
    JwtStrategy,
    EnvService,
    {
      provide: TokenRepository,
      useClass: TokenService,
    },
    {
      provide: RefreshTokenRepository,
      useClass: RefreshTokenService,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [TokenRepository, RefreshTokenRepository],
})
export class AuthModule {}
