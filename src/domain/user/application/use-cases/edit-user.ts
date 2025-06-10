import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/user-repository'
import { left, right, type Either } from '@/core/either'
import { UserNotFoundError } from './errors/user-not-found'
import { User } from '../../enterprise/entities/user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UserAvatarWatcher } from './user-avatar-watcher'
import { UserAvatarRepository } from '../repositories/user-avatar-repository'
import { UserAddressWatcher } from './user-address-watcher'
import { UserAddressRepository } from '../repositories/user-address-repository'
import { Address } from '@/shared/address/enterprise/address'
import { UserAddressList } from '../../enterprise/entities/user-address-list'

type EditUserUseCaseRequest = {
  id: string
  name: string
  addresses: {
    street: string
    number: string
    complement?: string | null
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }[]
  avatarId?: string
}

type EditUserUseCaseResponse = Either<
  UserNotFoundError,
  {
    data: User
  }
>

@Injectable()
export class EditUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private userAvatarRepository: UserAvatarRepository,
    private userAddressRepository: UserAddressRepository,
  ) {}

  async execute({
    id,
    name,
    addresses,
    avatarId,
  }: EditUserUseCaseRequest): Promise<EditUserUseCaseResponse> {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      return left(new UserNotFoundError())
    }

    user.updateName(name)

    const avatarWatcher = new UserAvatarWatcher(user.avatarId ?? null)

    avatarWatcher.update(avatarId ? new UniqueEntityID(avatarId) : null)

    if (avatarWatcher.hasChanged()) {
      const newAvatarId = avatarWatcher.getUpdatedId()

      if (newAvatarId) {
        await this.userAvatarRepository.attachAvatarToUser(
          user.id.toString(),
          newAvatarId.toString(),
        )
      }

      user.updateAvatar(newAvatarId)
    }

    const currentAddresses = await this.userAddressRepository.findManyByUserId(
      user.id.toString(),
    )

    const addressWatcher = new UserAddressWatcher(currentAddresses)

    const updatedAddresses = addresses.map((address) =>
      Address.create({
        ...address,
        userId: user.id,
      }),
    )

    addressWatcher.update(updatedAddresses)

    if (addressWatcher.hasChanged()) {
      const newAddresses = addressWatcher.getUpdatedAddresses()
      await this.userAddressRepository.upsertManyForUser(
        user.id.toString(),
        newAddresses,
      )

      user.updateAddress(new UserAddressList(newAddresses))
    }

    await this.usersRepository.save(user)

    return right({
      data: user,
    })
  }
}
