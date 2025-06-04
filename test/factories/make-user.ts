import { faker } from '@faker-js/faker'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User, type UserProps } from '@/domain/user/enterprise/entities/user'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { PrismaUserMapper } from '@/infra/database/prisma/mappers/user/prisma-user.mapper'

export function makeUser(
  override: Partial<UserProps> = {},
  id?: UniqueEntityID,
) {
  const user = User.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      passwordHash: faker.internet.password(),
      role: 'OPERATOR',
      isActive: true,
      ...override,
    },
    id,
  )

  return user
}

@Injectable()
export class UserFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaUser(data: Partial<UserProps> = {}): Promise<User> {
    const user = makeUser(data)

    await this.prisma.user.create({
      data: PrismaUserMapper.toPrisma(user),
    })

    return user
  }

  async makeManyPrismaUser(data: Partial<UserProps>[] = []): Promise<User[]> {
    const users = data.map((attrs) => makeUser(attrs))

    if (users.length === 0) {
      return []
    }

    await this.prisma.user.createMany({
      data: users.map(PrismaUserMapper.toPrisma),
    })

    return users
  }
}
