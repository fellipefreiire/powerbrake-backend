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
import { retryWithBackoff } from '@/shared/utils/retry-with-backoff'
import { LoggerService } from '@/infra/logger/winston/logger.service'

@Injectable()
export class R2Storage implements Uploader {
  private client: S3Client
  private bucketName: string
  private readonly timeout: number
  private readonly retryAttempts: number
  private readonly retryBackoffMs: number

  constructor(
    envService: EnvService,
    private logger: LoggerService,
  ) {
    const accountId = envService.get('CLOUDFLARE_ACCOUNT_ID')
    this.bucketName = envService.get('AWS_BUCKET_NAME')
    this.timeout = envService.get('STORAGE_TIMEOUT')
    this.retryAttempts = envService.get('STORAGE_RETRY_ATTEMPTS')
    this.retryBackoffMs = envService.get('STORAGE_RETRY_BACKOFF')

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

    await retryWithBackoff(
      () =>
        withTimeout(
          this.client.send(
            new PutObjectCommand({
              Bucket: this.bucketName,
              Key: uniqueFileName,
              ContentType: fileType,
              Body: body,
            }),
          ),
          this.timeout,
        ),
      {
        retries: this.retryAttempts,
        initialDelayMs: this.retryBackoffMs,
        factor: 2,
        onRetry: (err, attempt) => {
          this.logger.warn(
            `Storage upload retry #${attempt} after error: ${err}`,
          )
        },
      },
    )

    return {
      url: uniqueFileName,
    }
  }

  async delete(fileName: string): Promise<void> {
    await retryWithBackoff(
      () =>
        withTimeout(
          this.client.send(
            new DeleteObjectCommand({
              Bucket: this.bucketName,
              Key: fileName,
            }),
          ),
          this.timeout,
        ),
      {
        retries: this.retryAttempts,
        initialDelayMs: this.retryBackoffMs,
        factor: 2,
        onRetry: (err, attempt) => {
          this.logger.warn(
            `Storage delete retry #${attempt} after error: ${err}`,
          )
        },
      },
    )
  }
}
