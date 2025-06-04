import { Provider } from '@nestjs/common'
import { createDomainLogger } from './winston.config'
import { WINSTON_LOGGER } from './winston.token'

export const WinstonLoggerProvider: Provider = {
  provide: WINSTON_LOGGER,
  useFactory: () => createDomainLogger('api'),
}
