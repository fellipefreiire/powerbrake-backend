import { WatchedList } from '@/core/entities/watched-list'
import type { Address } from '@/shared/address/enterprise/address'

export class UserAddressList extends WatchedList<Address> {
  compareItems(a: Address, b: Address): boolean {
    return a.id.equals(b.id)
  }
}
