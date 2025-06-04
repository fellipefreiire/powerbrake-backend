// src/infra/decorators/service-tag.decorator.ts
import { SetMetadata } from '@nestjs/common'
export const SERVICE_TAG = 'SERVICE_TAG'
export const ServiceTag = (tag: string) => SetMetadata(SERVICE_TAG, tag)
