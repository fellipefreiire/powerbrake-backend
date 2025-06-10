import { Uploader, UploadParams } from '@/shared/storage/uploader'
import { randomUUID } from 'node:crypto'

type Upload = {
  fileName: string
  url: string
}

export class FakeUploader implements Uploader {
  public uploads: Upload[] = []

  async upload({ fileName }: UploadParams): Promise<{ url: string }> {
    const url = randomUUID()

    this.uploads.push({
      fileName,
      url,
    })

    return { url }
  }

  async delete(url: string): Promise<void> {
    const uploadIndex = this.uploads.findIndex((upload) => upload.url === url)

    if (uploadIndex > -1) {
      this.uploads.splice(uploadIndex, 1)
    }
  }
}
