import { Injectable } from '@nestjs/common'
import { HealthIndicatorResult } from '@nestjs/terminus'
import { Uploader } from '@/shared/storage/uploader'

@Injectable()
export class S3HealthIndicator {
  constructor(private uploader: Uploader) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const healthCheckFileBaseName = `healthcheck-${Date.now()}.txt`
    let actualUploadedFileName: string | null = null

    try {
      const uploadResult = await this.uploader.upload({
        fileName: healthCheckFileBaseName,
        fileType: 'text/plain',
        body: Buffer.from('health-check'),
      })
      actualUploadedFileName = uploadResult.url

      return {
        [key]: { status: 'up' },
      }
    } catch (error) {
      console.error('S3 Health check upload failed:', error)
      return {
        [key]: { status: 'down' },
      }
    } finally {
      if (actualUploadedFileName) {
        try {
          await this.uploader.delete(actualUploadedFileName)
        } catch (deleteError) {
          console.error(
            `Failed to delete health check file ${actualUploadedFileName}:`,
            deleteError,
          )
        }
      }
    }
  }
}
