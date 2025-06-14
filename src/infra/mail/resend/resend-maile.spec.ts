import { vi, describe, it, expect, beforeEach } from 'vitest'

import { ResendMailer } from '@/infra/mail/resend/resend-mailer'
import { FakeLogger } from 'test/infra/fake-logger'
import { Resend } from 'resend'
import { makeFakeEnvService } from 'test/infra/fake-env'

const sendEmailMock = vi.fn()

vi.mock('resend', () => {
  return {
    Resend: vi.fn().mockImplementation(() => {
      return {
        emails: {
          send: sendEmailMock,
        },
      }
    }),
  }
})

describe('ResendMailer', () => {
  const logger = new FakeLogger()
  const env = makeFakeEnvService()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should instantiate Resend client on creation', () => {
    new ResendMailer(env, logger)
    expect(Resend).toHaveBeenCalledTimes(1)
    expect(Resend).toHaveBeenCalledWith(env.get('RESEND_API_KEY'))
  })

  it('should send email using Resend with correct parameters', async () => {
    sendEmailMock.mockResolvedValueOnce({
      data: { id: 'email_id' },
      error: null,
    })

    const sut = new ResendMailer(env, logger)
    await sut.send({
      to: 'john@example.com',
      subject: 'Test',
      html: '<p>Hello</p>',
    })

    expect(sendEmailMock).toHaveBeenCalledWith({
      from: 'onboarding@resend.dev',
      to: 'john@example.com',
      subject: 'Test',
      html: '<p>Hello</p>',
    })
    expect(sendEmailMock).toHaveBeenCalledTimes(1)
  })

  it('should throw if resend fails and circuit breaker logic is tested', async () => {
    sendEmailMock.mockRejectedValue(new Error('resend failure'))

    const sut = new ResendMailer(env, logger)

    await expect(() =>
      sut.send({
        to: 'fail@example.com',
        subject: 'Failure',
        html: '<p>Oops</p>',
      }),
    ).rejects.toThrowError('resend failure')

    expect(sendEmailMock).toHaveBeenCalledTimes(env.get('EMAIL_RETRY_ATTEMPTS'))
  })

  it('should call logger on retries', async () => {
    sendEmailMock.mockRejectedValue(new Error('transient error'))
    const sut = new ResendMailer(env, logger)
    const loggerSpy = vi.spyOn(logger, 'warn')

    await expect(() =>
      sut.send({
        to: 'fail@example.com',
        subject: 'Failure',
        html: '<p>Oops</p>',
      }),
    ).rejects.toThrow()

    expect(loggerSpy).toHaveBeenCalledTimes(env.get('EMAIL_RETRY_ATTEMPTS') - 1)
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Email] retry #1'),
    )
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Email] retry #2'),
    )
  })
})
