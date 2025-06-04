import { Module } from '@nestjs/common'
import { UserControllersModule } from './controllers/user/user-controllers.module'
import { AvatarControllersModule } from './controllers/avatar/avatar-controllers.module'

@Module({
  imports: [UserControllersModule, AvatarControllersModule],
})
export class HttpModule {}
