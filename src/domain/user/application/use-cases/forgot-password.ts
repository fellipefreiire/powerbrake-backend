import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { Encrypter } from '@/shared/cryptography/encrypter'
import { MailRepository } from '@/infra/mail/mail-repository'
import { UsersRepository } from '../repositories/user-repository'

interface ForgotPasswordUseCaseRequest {
  email: string
  resetPasswordUrl: string
}

type ForgotPasswordUseCaseResponse = Either<null, null>

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly encrypter: Encrypter,
    private readonly mailer: MailRepository,
  ) {}

  async execute({
    email,
    resetPasswordUrl,
  }: ForgotPasswordUseCaseRequest): Promise<ForgotPasswordUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      return right(null)
    }

    const token = await this.encrypter.encrypt({ sub: user.id })

    const url = `${resetPasswordUrl}?token=${token}`

    await this.mailer.send({
      to: user.email,
      subject: 'Redefina sua senha',
      html: `<p>Olá,</p><p>Para redefinir sua senha, <a href="${url}">clique aqui</a>. Este link expira em 1 hora.</p>`,
    })

    return right(null)
  }
}
