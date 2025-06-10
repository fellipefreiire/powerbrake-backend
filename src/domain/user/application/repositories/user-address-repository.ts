import type { Address } from '@/shared/address/enterprise/entities/address'

export abstract class UserAddressRepository {
  abstract findManyByUserId(userId: string): Promise<Address[]>
  abstract upsertManyForUser(
    userId: string,
    addresses: Address[],
  ): Promise<void>
}
