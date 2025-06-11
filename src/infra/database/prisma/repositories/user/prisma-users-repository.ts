import type { PaginationParams } from '@/core/repositories/pagination-params'
import type { UsersRepository } from '@/domain/user/application/repositories/user-repository'
import { User } from '@/domain/user/enterprise/entities/user'
import { Injectable } from '@nestjs/common'
import { CacheRepository } from '@/infra/cache/cache-repository'
import { PrismaService } from '../../prisma.service'
import { PrismaUserMapper } from '../../mappers/user/prisma-user.mapper'
import { DomainEvents } from '@/core/events/domain-events'

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(
    private prisma: PrismaService,
    private cache: CacheRepository,
  ) {}

  async findById(id: string): Promise<User | null> {
    const cacheHit = await this.cache.get(`user:${id}:details`)

    if (cacheHit) {
      const cachedData = JSON.parse(cacheHit)

      return PrismaUserMapper.toDomain(cachedData)
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id,
      },
      include: {
        addresses: true,
      },
    })

    if (!user) {
      return null
    }

    await this.cache.set(`user:${id}:details`, JSON.stringify(user))

    return PrismaUserMapper.toDomain(user)
  }

  async findManyByIds(ids: string[]): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        addresses: true,
      },
    })

    return users.map(PrismaUserMapper.toDomain)
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
      include: {
        addresses: true,
      },
    })

    if (!user) {
      return null
    }

    const userDetails = PrismaUserMapper.toDomain(user)

    return userDetails
  }

  async list({
    page = 1,
    perPage = 20,
  }: PaginationParams): Promise<[User[], number]> {
    const cacheHit = await this.cache.get(`users:page:${page}:${perPage}`)

    if (cacheHit) {
      const cachedData = JSON.parse(cacheHit)

      return cachedData.map(PrismaUserMapper.toDomain)
    }

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          addresses: true,
        },
      }),
      this.prisma.user.count(),
    ])

    await this.cache.set(`users:page:${page}:${perPage}`, JSON.stringify(users))

    return [users.map(PrismaUserMapper.toDomain), total]
  }

  async save(user: User): Promise<void> {
    const data = PrismaUserMapper.toPrisma(user)

    await Promise.all([
      this.prisma.user.update({
        where: { id: data.id },
        data,
      }),
      this.cache.del(`user:${data.id}:details`),
    ])

    DomainEvents.dispatchEventsForAggregate(user.id)
  }

  async create(user: User): Promise<void> {
    const data = PrismaUserMapper.toPrisma(user)

    await Promise.all([
      this.prisma.user.create({
        data,
      }),
      this.cache.del('users'),
    ])
  }

  async delete(user: User): Promise<void> {
    const data = PrismaUserMapper.toPrisma(user)

    await Promise.all([
      this.prisma.user.delete({
        where: { id: data.id },
      }),
      this.cache.del(`user:${data.id}:details`),
      this.cache.del(`users`),
    ])
  }
}
