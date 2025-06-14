import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import { R2Storage } from '@/infra/storage/r2/r2-storage'
import { makeFakeEnvService } from 'test/infra/fake-env'
import { FakeLogger } from 'test/infra/fake-logger'
import { S3Client } from '@aws-sdk/client-s3'

const { s3SendMock, PutObjectCommandMock, DeleteObjectCommandMock } =
  vi.hoisted(() => {
    return {
      s3SendMock: vi.fn(),
      PutObjectCommandMock: vi.fn(),
      DeleteObjectCommandMock: vi.fn(),
    }
  })

vi.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: vi.fn().mockImplementation(() => ({
      send: s3SendMock,
    })),
    PutObjectCommand: PutObjectCommandMock,
    DeleteObjectCommand: DeleteObjectCommandMock,
  }
})

describe('R2Storage', () => {
  let sut: R2Storage
  let envService: ReturnType<typeof makeFakeEnvService>
  let logger: FakeLogger

  const uploadParams = {
    fileName: 'profile.png',
    fileType: 'image/png',
    body: Buffer.from(''),
  }

  beforeEach(() => {
    envService = makeFakeEnvService()
    logger = new FakeLogger()
    sut = new R2Storage(envService, logger)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should instantiate S3 client with correct credentials', () => {
    expect(S3Client).toHaveBeenCalledWith({
      endpoint: `https://${envService.get('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      region: 'auto',
      credentials: {
        accessKeyId: envService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: envService.get('AWS_SECRET_ACCESS_KEY'),
      },
    })
  })

  describe('upload()', () => {
    it('should upload a file successfully', async () => {
      s3SendMock.mockResolvedValue({})

      const result = await sut.upload(uploadParams)

      expect(result.url).toEqual(expect.any(String))
      expect(s3SendMock).toHaveBeenCalledTimes(1)
      expect(PutObjectCommandMock).toHaveBeenCalledWith({
        Bucket: envService.get('AWS_BUCKET_NAME'),
        Key: expect.stringContaining(uploadParams.fileName),
        ContentType: uploadParams.fileType,
        Body: uploadParams.body,
      })
    })

    it('should throw and retry if upload fails', async () => {
      s3SendMock.mockRejectedValue(new Error('S3 Failure'))
      const loggerSpy = vi.spyOn(logger, 'warn')

      await expect(sut.upload(uploadParams)).rejects.toThrow('S3 Failure')

      expect(s3SendMock).toHaveBeenCalledTimes(
        envService.get('STORAGE_RETRY_ATTEMPTS'),
      )
      expect(loggerSpy).toHaveBeenCalledTimes(
        envService.get('STORAGE_RETRY_ATTEMPTS') - 1,
      )
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Storage] upload retry #1'),
      )
    })
  })

  describe('delete()', () => {
    it('should delete a file successfully', async () => {
      s3SendMock.mockResolvedValue({})
      const fileName = 'test-file-to-delete.png'

      await sut.delete(fileName)

      expect(s3SendMock).toHaveBeenCalledTimes(1)
      expect(DeleteObjectCommandMock).toHaveBeenCalledWith({
        Bucket: envService.get('AWS_BUCKET_NAME'),
        Key: fileName,
      })
    })

    it('should throw and retry if delete fails', async () => {
      s3SendMock.mockRejectedValue(new Error('S3 Delete Failure'))
      const loggerSpy = vi.spyOn(logger, 'warn')

      await expect(sut.delete('any-file')).rejects.toThrow('S3 Delete Failure')

      expect(s3SendMock).toHaveBeenCalledTimes(
        envService.get('STORAGE_RETRY_ATTEMPTS'),
      )
      expect(loggerSpy).toHaveBeenCalledTimes(
        envService.get('STORAGE_RETRY_ATTEMPTS') - 1,
      )
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Storage] delete retry #1'),
      )
    })
  })
})
