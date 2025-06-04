import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common'
import { isUUID } from 'class-validator'

@Injectable()
export class ParseUuidPipe implements PipeTransform<string> {
  transform(value: string, meta: ArgumentMetadata) {
    if (!isUUID(value, '4')) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: `Param ${meta.data ?? 'id'} must be a valid UUID`,
      })
    }
    return value
  }
}
