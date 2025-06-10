import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User } from '@/domain/user/enterprise/entities/user'
import { UserAddressList } from '@/domain/user/enterprise/entities/user-address-list'
import { User as PrismaUser, Prisma, Address } from '@prisma/client'
import { PrismaUserAddressMapper } from './prisma-user-address.mapper'

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser & { addresses: Address[] }): User {
    return User.create(
      {
        name: raw.name,
        email: raw.email,
        passwordHash: raw.passwordHash,
        isActive: raw.isActive,
        role: raw.role,
        avatarId: raw.avatarId ? new UniqueEntityID(raw.avatarId) : undefined,
        addresses: new UserAddressList(
          raw.addresses.map((address) =>
            PrismaUserAddressMapper.toDomain(address),
          ),
        ),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(user: User): Prisma.UserCreateInput {
    const base: Prisma.UserCreateInput = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      isActive: user.isActive,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    if (user.avatarId) {
      base.avatar = {
        connect: {
          id: user.avatarId?.toString(),
        },
      }
    }
    return base
  }
}
