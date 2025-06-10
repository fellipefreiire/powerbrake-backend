import { Injectable } from '@nestjs/common'
import { UserAddressRepository } from '@/domain/user/application/repositories/user-address-repository'
import { PrismaService } from '../../prisma.service'
import type { Address } from '@/shared/address/enterprise/address'
import { PrismaUserAddressMapper } from '../../mappers/user/prisma-user-address.mapper'

@Injectable()
export class PrismaUserAddressRepository implements UserAddressRepository {
  constructor(private prisma: PrismaService) {}

  async findManyByUserId(userId: string): Promise<Address[]> {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
    })

    return addresses.map(PrismaUserAddressMapper.toDomain)
  }

  async upsertManyForUser(userId: string, addresses: Address[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.address.deleteMany({ where: { userId } })

      for (const address of addresses) {
        const data = PrismaUserAddressMapper.toPrisma(address)
        await tx.address.create({ data })
      }
    })
  }
}
