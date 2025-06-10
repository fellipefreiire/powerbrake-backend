import { UserAddressRepository } from '@/domain/user/application/repositories/user-address-repository'
import { Address } from '@/shared/address/enterprise/entities/address'

export class InMemoryUserAddressRepository implements UserAddressRepository {
  public items: Address[] = []

  async findManyByUserId(userId: string): Promise<Address[]> {
    return this.items.filter((address) => address.userId?.toString() === userId)
  }

  async upsertManyForUser(userId: string, addresses: Address[]): Promise<void> {
    this.items = this.items.filter(
      (address) => address.userId?.toString() !== userId,
    )

    this.items.push(...addresses)
  }
}
