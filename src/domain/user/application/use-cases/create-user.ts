import { left, right, type Either } from '@/core/either'
import { UsersRepository } from '@/domain/user/application/repositories/user-repository'
import { User } from '@/domain/user/enterprise/entities/user'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import { Injectable } from '@nestjs/common'
import { HashGenerator } from '@/shared/cryptography/hash-generator'
import type { Role } from '@prisma/client'
import { Address } from '@/shared/address/enterprise/entities/address'
import { UserAddressRepository } from '../repositories/user-address-repository'
import { UserAddressList } from '../../enterprise/entities/user-address-list'
import { UserUnauthorizedError } from './errors/user-unauthorized-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

interface CreateUserUseCaseRequest {
  actorId: string
  name: string
  email: string
  password: string
  role: Role
  addresses: {
    street: string
    number: string
    complement?: string | null
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }[]
}

type CreateUserUseCaseResponse = Either<
  UserAlreadyExistsError | UserUnauthorizedError,
  {
    data: User
  }
>

@Injectable()
export class CreateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashGenerator: HashGenerator,
    private userAddressRepository: UserAddressRepository,
  ) {}

  async execute({
    actorId,
    name,
    email,
    password,
    role,
    addresses,
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    if (!actorId) {
      return left(new UserUnauthorizedError())
    }

    const userAlreadyExists = await this.usersRepository.findByEmail(email)

    if (userAlreadyExists) {
      return left(new UserAlreadyExistsError(email))
    }

    const passwordHash = await this.hashGenerator.hash(password)

    const user = User.create(
      {
        email,
        isActive: true,
        name,
        passwordHash,
        role,
      },
      undefined,
      new UniqueEntityID(actorId),
    )

    const addressList = new UserAddressList(
      addresses.map((a) =>
        Address.create({
          ...a,
          userId: user.id,
        }),
      ),
    )

    user.updateAddress(addressList)

    await this.usersRepository.create(user)

    await this.userAddressRepository.upsertManyForUser(
      user.id.toString(),
      addressList.getItems(),
    )

    return right({
      data: user,
    })
  }
}
