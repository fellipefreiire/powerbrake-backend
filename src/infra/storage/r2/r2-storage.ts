import { Uploader, type UploadParams } from '@/shared/storage/uploader'
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { EnvService } from '@/infra/env/env.service'
import { withTimeout } from '@/shared/utils/with-timeout'

@Injectable()
export class R2Storage implements Uploader {
  private client: S3Client
  private bucketName: string
  private readonly timeout: number

  constructor(envService: EnvService) {
    const accountId = envService.get('CLOUDFLARE_ACCOUNT_ID')
    this.bucketName = envService.get('AWS_BUCKET_NAME')
    this.timeout = Number(envService.get('STORAGE_TIMEOUT')) || 5000

    this.client = new S3Client({
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      region: 'auto',
      credentials: {
        accessKeyId: envService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: envService.get('AWS_SECRET_ACCESS_KEY'),
      },
    })
  }

  async upload({
    body,
    fileName,
    fileType,
  }: UploadParams): Promise<{ url: string }> {
    const uploadId = randomUUID()
    const uniqueFileName = `${uploadId}-${fileName}`

    await withTimeout(
      this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: uniqueFileName,
          ContentType: fileType,
          Body: body,
        }),
      ),
      this.timeout,
    )

    return {
      url: uniqueFileName,
    }
  }

  async delete(fileName: string): Promise<void> {
    await withTimeout(
      this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
        }),
      ),
      this.timeout,
    )
  }
}
