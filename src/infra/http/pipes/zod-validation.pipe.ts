import {
  PipeTransform,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ZodError, ZodSchema } from 'zod'
import { fromZodError } from 'zod-validation-error'

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value)
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors

        const hasMissing = issues.some(
          (i) => i.code === 'invalid_type' && i.received === 'undefined',
        )

        const formatted = fromZodError(error)

        if (hasMissing) {
          throw new BadRequestException({
            statusCode: 400,
            message: 'Missing required fields',
            errors: formatted,
          })
        }

        throw new UnprocessableEntityException({
          statusCode: 422,
          message: 'Validation failed',
          errors: formatted,
        })
      }

      throw new BadRequestException('Validation failed')
    }
  }
}
