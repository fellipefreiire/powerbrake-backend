import {
  Controller,
  FileTypeValidator,
  HttpCode,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { UploadAndCreateAvatarUseCase } from '@/shared/avatar/application/use-cases/upload-and-create-avatar'
import { CaslAbilityGuard } from '@/infra/auth/casl/casl-ability.guard'
import { ServiceTag } from '@/infra/decorators/service-tag.decorator'
import { CheckPolicies } from '@/infra/auth/casl/check-policies.decorator'
import { UploadAvatarRequestDto } from '../../dtos/requests/avatar'
import { UploadAvatarResponseDto } from '../../dtos/response/avatar'
import {
  AvatarForbiddenDto,
  AvatarUploadFailedDto,
} from '../../dtos/error/avatar'
import { AvatarErrorFilter } from '../../filters/avatar-error.filter'

@UseFilters(AvatarErrorFilter)
@ApiTags('Avatar')
@ServiceTag('avatar')
@Controller({ path: 'avatar/user', version: '1' })
export class UploadUserAvatarController {
  constructor(private uploadAndCreateAvatar: UploadAndCreateAvatarUseCase) {}

  @Post()
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckPolicies((ability) => ability.can('manage', 'Avatar'))
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ type: UploadAvatarRequestDto })
  @ApiCreatedResponse({ type: UploadAvatarResponseDto })
  @ApiForbiddenResponse({ type: AvatarForbiddenDto })
  @ApiInternalServerErrorResponse({ type: AvatarUploadFailedDto })
  async handle(
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
    })

    if (result.isLeft()) {
      throw result.value
    }

    return {
      data: result.value.data.id.toString(),
    }
  }
}
