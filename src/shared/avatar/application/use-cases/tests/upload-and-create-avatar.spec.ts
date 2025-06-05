import { InMemoryAvatarRepository } from 'test/repositories/avatar/in-memory-avatar-repository'
import { UploadAndCreateAvatarUseCase } from '../upload-and-create-avatar'
import { FakeUploader } from 'test/storage/fake-uploader'
import { AvatarUploadFailedError } from '../errors/avatar-upload-failed-error'
import { Avatar } from '@/shared/avatar/enterprise/entities/avatar'

let inMemoryAvatarRepository: InMemoryAvatarRepository
let fakeUploader: FakeUploader
let sut: UploadAndCreateAvatarUseCase

describe('Upload and Create Avatar', () => {
  beforeEach(() => {
    inMemoryAvatarRepository = new InMemoryAvatarRepository()
    fakeUploader = new FakeUploader()

    sut = new UploadAndCreateAvatarUseCase(
      inMemoryAvatarRepository,
      fakeUploader,
    )
  })

  it('should upload avatar and persist it', async () => {
    const result = await sut.execute({
      fileName: 'avatar.png',
      fileType: 'image/png',
      body: Buffer.from('fake'),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.data).toBeInstanceOf(Avatar)
      expect(result.value.data.url).toEqual(fakeUploader.uploads[0].url)
    }
  })

  it('should return UploadAvatarFailedError when upload fails', async () => {
    vi.spyOn(fakeUploader, 'upload').mockResolvedValueOnce({
      url: null as unknown as string,
    })

    const result = await sut.execute({
      fileName: 'avatar.png',
      fileType: 'image/png',
      body: Buffer.from('fake'),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(AvatarUploadFailedError)
  })
})
