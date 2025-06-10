import type { Address } from '@/shared/address/enterprise/address'

export abstract class UserAddressRepository {
  abstract findManyByUserId(userId: string): Promise<Address[]>
  abstract upsertManyForUser(
    userId: string,
    addresses: Address[],
  ): Promise<void>
}
