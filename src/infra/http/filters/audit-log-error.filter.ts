import { Catch } from '@nestjs/common'
import { AppErrorFilter } from './app-error.filter'

@Catch()
export class AuditLogErrorFilter extends AppErrorFilter {
  protected override mapDomainErrorToStatus(name: string): number {
    switch (name) {
      default:
        return super.mapDomainErrorToStatus(name)
    }
  }
}
