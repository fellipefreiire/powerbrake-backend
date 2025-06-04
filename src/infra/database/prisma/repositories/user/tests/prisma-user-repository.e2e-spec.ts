import { UserDatabaseModule } from './../user-database.module'
import { INestApplication, VersioningType } from '@nestjs/common'
import { UserFactory } from 'test/factories/make-user'
import { CacheRepository } from '@/infra/cache/cache-repository'
import { Test } from '@nestjs/testing'
import { AppModule } from '@/infra/app.module'
import { CacheModule } from '@/infra/cache/cache.module'
import { UsersRepository } from '@/domain/user/application/repositories/user-repository'

describe('Prisma Users Repository (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory
  let cacheRepository: CacheRepository
  let usersRepository: UsersRepository

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, UserDatabaseModule, CacheModule],
    }).compile()

    app = moduleRef.createNestApplication()
    app.enableVersioning({
      type: VersioningType.URI,
    })

    userFactory = moduleRef.get(UserFactory)
    cacheRepository = moduleRef.get(CacheRepository)
    usersRepository = moduleRef.get(UsersRepository)

    await app.init()
  })

  it('should cache user details', async () => {
    const user = await userFactory.makePrismaUser({})

    const id = user.id.toString()

    const userDetails = await usersRepository.findById(id)

    const cached = await cacheRepository.get(`user:${id}:details`)

    if (!cached) {
      throw new Error()
    }

    expect(JSON.parse(cached)).toEqual(
      expect.objectContaining({
        id: userDetails?.id.toString(),
      }),
    )
  })

  it('should return cached user details on subsequent calls', async () => {
    const user = await userFactory.makePrismaUser({})

    const id = user.id.toString()

    let cached = await cacheRepository.get(`user:${id}:details`)

    expect(cached).toBeNull()

    await usersRepository.findById(id)

    cached = await cacheRepository.get(`user:${id}:details`)

    expect(cached).not.toBeNull()

    if (!cached) {
      throw new Error()
    }

    const userDetails = await usersRepository.findById(id)

    expect(JSON.parse(cached)).toEqual(
      expect.objectContaining({
        id: userDetails?.id.toString(),
      }),
    )
  })

  it('should reset user details cache when saving the user', async () => {
    const user = await userFactory.makePrismaUser({})

    const id = user.id.toString()

    await cacheRepository.set(
      `user:${id}:details`,
      JSON.stringify({ empty: true }),
    )

    await usersRepository.save(user)

    const cached = await cacheRepository.get(`user:${id}:details`)

    expect(cached).toBeNull()
  })

  it('should clear caches when deleting the user', async () => {
    const user = await userFactory.makePrismaUser({})

    const id = user.id.toString()

    await cacheRepository.set(`user:${id}:details`, JSON.stringify(user))
    await cacheRepository.set('users', JSON.stringify([user]))

    await usersRepository.delete(user)

    const cachedDetails = await cacheRepository.get(`user:${id}:details`)
    const cachedList = await cacheRepository.get('users')

    expect(cachedDetails).toBeNull()
    expect(cachedList).toBeNull()
  })
})
