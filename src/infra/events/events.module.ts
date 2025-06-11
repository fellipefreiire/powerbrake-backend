import { Module } from '@nestjs/common'
import { UserEventsModule } from './user/user-events.module'

@Module({
  imports: [UserEventsModule],
})
export class EventsModule {}
