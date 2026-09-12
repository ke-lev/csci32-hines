import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { resendConstructor, sendEmail } = vi.hoisted(() => {
  const sendEmail = vi.fn()
  const resendConstructor = vi.fn()

  return {
    sendEmail,
    resendConstructor,
  }
})

vi.mock('server-only', () => ({}))
vi.mock('resend', () => {
  function Resend(...args: unknown[]) {
    resendConstructor(...args)
    return { emails: { send: sendEmail } }
  }

  return { Resend }
})

import { sendTipNotification } from '../app/lib/tip-email'

const ORIGINAL_ENV = { ...process.env }

beforeEach(() => {
  vi.clearAllMocks()
  process.env.RESEND_API_KEY = 're_test'
  process.env.RESEND_FROM_EMAIL = 'site tips <tips@example.com>'
  process.env.TIP_NOTIFICATION_EMAIL = 'owner@example.com'
  process.env.SITE_URL = 'https://example.com/base/'
  sendEmail.mockResolvedValue({ data: { id: 'email-1' }, error: null })
})

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe('sendTipNotification', () => {
  it('sends the tip to the configured owner with a stable idempotency key', async () => {
    await sendTipNotification({ body: '<b>keep this as text</b>', receipt: 'tip-123' })

    expect(resendConstructor).toHaveBeenCalledWith('re_test')
    expect(sendEmail).toHaveBeenCalledWith(
      {
        from: 'site tips <tips@example.com>',
        to: 'owner@example.com',
        subject: 'new site tip — tip-123',
        text: [
          'a new tip was submitted through the site.',
          '',
          '<b>keep this as text</b>',
          '',
          'receipt: tip-123',
          'open inbox: https://example.com/admin',
        ].join('\n'),
      },
      { idempotencyKey: 'tip-notification/tip-123' },
    )
  })

  it('fails clearly when the integration is not configured', async () => {
    delete process.env.RESEND_API_KEY

    await expect(sendTipNotification({ body: 'hello', receipt: 'tip-123' })).rejects.toThrow(
      'RESEND_API_KEY is required to send tip notifications',
    )
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('turns a Resend API rejection into an error the server action can log', async () => {
    sendEmail.mockResolvedValue({ data: null, error: { message: 'domain is not verified' } })

    await expect(sendTipNotification({ body: 'hello', receipt: 'tip-123' })).rejects.toThrow(
      'Resend rejected the tip notification: domain is not verified',
    )
  })
})
