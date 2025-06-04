import { left, right, type Either } from '@/core/either'
import { Avatar } from '../../enterprise/entities/avatar'
import { Injectable } from '@nestjs/common'
import { AvatarRepository } from '../repositories/avatar-repository'
import { Uploader } from '@/shared/avatar/application/storage/uploader'
import { InvalidAvatarTypeError } from './errors/invalid-avatar-type-error'
import { UserAvatarRepository } from '@/domain/user/application/repositories/user-avatar-repository'
import { UserAvatar } from '@/domain/user/enterprise/entities/user-avatar'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

type UploadAndCreateAvatarUseCaseRequest = {
  userId: string
  fileName: string
  fileType: string
  body: Buffer
}

type UploadAndCreateAvatarUseCaseResponse = Either<
  InvalidAvatarTypeError,
  {
    data: Avatar
  }
>

@Injectable()
export class UploadAndCreateAvatarUseCase {
  constructor(
    private avatarRepository: AvatarRepository,
    private userAvatarRepository: UserAvatarRepository,
    private uploader: Uploader,
  ) {}

  async execute({
    userId,
    fileName,
    fileType,
    body,
  }: UploadAndCreateAvatarUseCaseRequest): Promise<UploadAndCreateAvatarUseCaseResponse> {
    if (!/^(image\/(jpeg|jpg|png))$/.test(fileType)) {
      return left(new InvalidAvatarTypeError(fileType))
    }

    const userAvatar = await this.userAvatarRepository.findByUserId(userId)

    if (userAvatar?.avatarId) {
      const existingAvatar = await this.avatarRepository.findById(
        userAvatar.avatarId.toString(),
      )

      if (existingAvatar) {
        await this.avatarRepository.delete(existingAvatar.id.toString())
        await this.uploader.delete(existingAvatar.url)
      }
    }

    const { url } = await this.uploader.upload({ fileName, fileType, body })

    const avatar = Avatar.create({
      title: fileName,
      url,
    })

    await this.avatarRepository.create(avatar)

    const newUserAvatar = UserAvatar.create({
      userId: new UniqueEntityID(userId),
      avatarId: avatar.id,
    })

    await this.userAvatarRepository.create(newUserAvatar)

    return right({
      data: avatar,
    })
  }
}
