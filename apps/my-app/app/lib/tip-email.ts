import 'server-only'

import { Resend } from 'resend'

type TipNotification = {
  body: string
  receipt: string
}

function getRequiredEnv(name: 'RESEND_API_KEY' | 'RESEND_FROM_EMAIL' | 'SITE_URL' | 'TIP_NOTIFICATION_EMAIL') {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`${name} is required to send tip notifications`)
  }

  return value
}

export async function sendTipNotification({ body, receipt }: TipNotification) {
  const resend = new Resend(getRequiredEnv('RESEND_API_KEY'))
  const adminUrl = new URL('/admin', getRequiredEnv('SITE_URL')).toString()
  const from = getRequiredEnv('RESEND_FROM_EMAIL')
  const to = getRequiredEnv('TIP_NOTIFICATION_EMAIL')

  const { error } = await resend.emails.send(
    {
      from,
      to,
      subject: `new site tip — ${receipt}`,
      text: [
        'a new tip was submitted through the site.',
        '',
        body,
        '',
        `receipt: ${receipt}`,
        `open inbox: ${adminUrl}`,
      ].join('\n'),
    },
    { idempotencyKey: `tip-notification/${receipt}` },
  )

  if (error) {
    throw new Error(`Resend rejected the tip notification: ${error.message}`)
  }
}
