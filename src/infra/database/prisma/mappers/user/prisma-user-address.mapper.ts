import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Address } from '@/shared/address/enterprise/address'
import { Address as PrismaAddress, Prisma } from '@prisma/client'

export class PrismaUserAddressMapper {
  static toDomain(raw: PrismaAddress): Address {
    return Address.create(
      {
        city: raw.city,
        neighborhood: raw.neighborhood,
        number: raw.number,
        state: raw.state,
        street: raw.street,
        zipCode: raw.zipCode,
        complement: raw.complement,
        userId: raw.userId ? new UniqueEntityID(raw.userId) : undefined,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(address: Address): Prisma.AddressCreateInput {
    return {
      id: address.id.toString(),
      user: {
        connect: {
          id: address.userId ? address.userId.toString() : undefined,
        },
      },
      street: address.street,
      number: address.number,
      complement: address.complement ?? undefined,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt ?? new Date(),
    }
  }
}
