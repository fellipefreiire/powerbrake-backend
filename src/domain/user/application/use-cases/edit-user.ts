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
import { Address } from '@/shared/address/enterprise/entities/address'
import { UserAddressList } from '../../enterprise/entities/user-address-list'

type EditUserUseCaseRequest = {
  id: string
  name?: string
  addresses?: {
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
    if (!user) return left(new UserNotFoundError())

    let finalName = user.name
    let finalAvatarId = user.avatarId ?? null
    let finalAddressList = user.addresses

    if (name) {
      finalName = name
    }

    if (avatarId !== undefined) {
      const avatarWatcher = new UserAvatarWatcher(user.avatarId ?? null)
      const newAvatarId = avatarId ? new UniqueEntityID(avatarId) : null

      avatarWatcher.update(newAvatarId)
      finalAvatarId = avatarWatcher.getUpdatedId()

      if (avatarWatcher.hasChanged() && newAvatarId) {
        await this.userAvatarRepository.attachAvatarToUser(
          user.id.toString(),
          newAvatarId.toString(),
        )
      }
    }

    if (addresses) {
      const currentAddresses =
        await this.userAddressRepository.findManyByUserId(id)

      const addressWatcher = new UserAddressWatcher(currentAddresses)
      const updatedAddresses = addresses.map((a) =>
        Address.create({ ...a, userId: user.id }),
      )

      addressWatcher.update(updatedAddresses)

      if (addressWatcher.hasChanged()) {
        await this.userAddressRepository.upsertManyForUser(
          user.id.toString(),
          updatedAddresses,
        )
        finalAddressList = new UserAddressList(updatedAddresses)
      }
    }

    user.update({
      name: finalName,
      avatarId: finalAvatarId,
      addresses: finalAddressList,
    })

    await this.usersRepository.save(user)

    return right({ data: user })
  }
}
