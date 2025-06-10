import { left, right, type Either } from '@/core/either'
import { Avatar } from '../../enterprise/entities/avatar'
import { Injectable } from '@nestjs/common'
import { AvatarRepository } from '../repositories/avatar-repository'
import { Uploader } from '@/shared/storage/uploader'
import { InvalidAvatarTypeError } from './errors/invalid-avatar-type-error'
import { AvatarUploadFailedError } from './errors/avatar-upload-failed-error'

type UploadAndCreateAvatarUseCaseRequest = {
  fileName: string
  fileType: string
  body: Buffer
}

type UploadAndCreateAvatarUseCaseResponse = Either<
  InvalidAvatarTypeError | AvatarUploadFailedError,
  {
    data: Avatar
  }
>

@Injectable()
export class UploadAndCreateAvatarUseCase {
  constructor(
    private avatarRepository: AvatarRepository,
    private uploader: Uploader,
  ) {}

  async execute({
    fileName,
    fileType,
    body,
  }: UploadAndCreateAvatarUseCaseRequest): Promise<UploadAndCreateAvatarUseCaseResponse> {
    if (!/^(image\/(jpeg|jpg|png))$/.test(fileType)) {
      return left(new InvalidAvatarTypeError(fileType))
    }

    const uploadResult = await this.uploader.upload({
      fileName,
      fileType,
      body,
    })

    if (!uploadResult || !uploadResult.url) {
      return left(new AvatarUploadFailedError())
    }

    const avatar = Avatar.create({
      title: fileName,
      url: uploadResult.url,
    })

    await this.avatarRepository.create(avatar)

    return right({
      data: avatar,
    })
  }
}
