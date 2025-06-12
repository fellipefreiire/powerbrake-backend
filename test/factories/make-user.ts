import { faker } from '@faker-js/faker'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User, type UserProps } from '@/domain/user/enterprise/entities/user'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { PrismaUserMapper } from '@/infra/database/prisma/mappers/user/prisma-user.mapper'
import { UserAddressList } from '@/domain/user/enterprise/entities/user-address-list'
import { Address } from '@/shared/address/enterprise/entities/address'

export function makeUser(
  override: Partial<Omit<UserProps, 'addresses'>> & {
    addresses?: Address[]
  } = {},
  id?: UniqueEntityID,
  actorId?: UniqueEntityID,
) {
  const { addresses, ...rest } = override

  const addressesList = addresses
    ? new UserAddressList(addresses)
    : new UserAddressList()

  const user = User.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      passwordHash: faker.internet.password(),
      role: 'OPERATOR',
      isActive: true,
      addresses: addressesList,
      ...rest,
    },
    id,
    actorId,
  )

  return user
}

@Injectable()
export class UserFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaUser(
    data: Partial<UserProps> & { addresses?: Address[] } = {},
  ): Promise<User> {
    const user = makeUser({
      ...data,
      addresses: data.addresses,
    })

    await this.prisma.user.create({
      data: PrismaUserMapper.toPrisma(user),
    })

    return user
  }

  async makeManyPrismaUser(
    data: (Partial<UserProps> & { addresses?: Address[] })[] = [],
  ): Promise<User[]> {
    const users = data.map((attrs) =>
      makeUser({
        ...attrs,
        addresses: attrs.addresses,
      }),
    )

    if (users.length === 0) return []

    await this.prisma.user.createMany({
      data: users.map(PrismaUserMapper.toPrisma),
    })

    return users
  }
}
