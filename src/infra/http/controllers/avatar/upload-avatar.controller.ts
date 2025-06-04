import { UserPayload } from './../../../auth/jwt.strategy'
import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { UploadAndCreateAvatarUseCase } from '@/shared/avatar/application/use-cases/upload-and-create-avatar'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserErrorFilter } from '../../filters/user-error.filter'

@UseFilters(UserErrorFilter)
@ApiTags('Users')
@ApiBearerAuth()
@Controller({ path: 'users/avatar', version: '1' })
@UseGuards(JwtAuthGuard)
export class UploadUserAvatarController {
  constructor(private uploadAndCreateAvatar: UploadAndCreateAvatarUseCase) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async handle(
    @CurrentUser() user: UserPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 2, // 2mb
          }),
          new FileTypeValidator({
            fileType: '.(png|jpg|jpeg)',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.uploadAndCreateAvatar.execute({
      fileName: file.originalname,
      fileType: file.mimetype,
      body: file.buffer,
      userId: user.sub,
    })

    if (result.isLeft()) {
      throw result.value
    }

    return {
      data: result.value.data.id.toString(),
    }
  }
}
