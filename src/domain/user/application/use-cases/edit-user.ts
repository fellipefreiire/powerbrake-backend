import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/user-repository'
import { left, right, type Either } from '@/core/either'
import { UserNotFoundError } from './errors/user-not-found'
import { User } from '../../enterprise/entities/user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UserAvatarWatcher } from './user-avatar-watcher'
import { UserAvatarRepository } from '../repositories/user-avatar-repository'

type EditUserUseCaseRequest = {
  id: string
  name: string
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
  ) {}

  async execute({
    id,
    name,
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

    await this.usersRepository.save(user)

    return right({
      data: user,
    })
  }
}
