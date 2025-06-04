import { InMemoryAvatarRepository } from 'test/repositories/avatar/in-memory-avatar-repository'
import { UploadAndCreateAvatarUseCase } from '../upload-and-create-avatar'
import { FakeUploader } from 'test/storage/fake-uploader'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeAvatar } from 'test/factories/make-avatar'
import { UserAvatar } from '@/domain/user/enterprise/entities/user-avatar'
import { InMemoryUserAvatarRepository } from 'test/repositories/user/in-memory-user-avatar-repository'

let inMemoryAvatarRepository: InMemoryAvatarRepository
let inMemoryUserAvatarRepository: InMemoryUserAvatarRepository
let fakeUploader: FakeUploader
let sut: UploadAndCreateAvatarUseCase

describe('Upload and Create Avatar', () => {
  beforeEach(() => {
    inMemoryAvatarRepository = new InMemoryAvatarRepository()
    inMemoryUserAvatarRepository = new InMemoryUserAvatarRepository()
    fakeUploader = new FakeUploader()

    sut = new UploadAndCreateAvatarUseCase(
      inMemoryAvatarRepository,
      inMemoryUserAvatarRepository,
      fakeUploader,
    )
  })

  it('should upload and create a new avatar for user without avatar', async () => {
    const userId = 'user-1'
    // Simula um usuário sem avatar
    await inMemoryUserAvatarRepository.create(
      UserAvatar.create({
        userId: new UniqueEntityID(userId),
        avatarId: new UniqueEntityID(), // sem avatar real ainda
      }),
    )

    const result = await sut.execute({
      userId,
      fileName: 'profile.png',
      fileType: 'image/png',
      body: Buffer.from(''),
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryAvatarRepository.items).toHaveLength(1)
    expect(fakeUploader.uploads).toHaveLength(1)
  })

  it('should replace existing avatar', async () => {
    const userId = 'user-1'
    const oldAvatar = makeAvatar(
      {
        title: 'old_profile.png',
        url: 'old-key.png',
      },
      new UniqueEntityID('avatar-1'),
    )

    await inMemoryAvatarRepository.create(oldAvatar)
    await inMemoryUserAvatarRepository.create(
      UserAvatar.create({
        userId: new UniqueEntityID(userId),
        avatarId: oldAvatar.id,
      }),
    )

    fakeUploader.uploads.push({
      fileName: oldAvatar.title,
      url: oldAvatar.url,
    })

    const avatarRepoDeleteSpy = vi.spyOn(inMemoryAvatarRepository, 'delete')

    const result = await sut.execute({
      userId,
      fileName: 'new_profile.png',
      fileType: 'image/jpeg',
      body: Buffer.from('new-image-data'),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      const newAvatar = result.value.data

      expect(avatarRepoDeleteSpy).toHaveBeenCalledWith(oldAvatar.id.toString())
      expect(fakeUploader.uploads).toHaveLength(1)
      expect(fakeUploader.uploads[0].fileName).toBe('new_profile.png')
      expect(
        inMemoryAvatarRepository.items.find((av) => av.id.equals(oldAvatar.id)),
      ).toBeUndefined()
      expect(
        inMemoryAvatarRepository.items.find((av) => av.id.equals(newAvatar.id)),
      ).toBeTruthy()
    }
  })
})
