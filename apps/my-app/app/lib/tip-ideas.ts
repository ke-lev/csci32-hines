import 'server-only'

import { randomBytes } from 'node:crypto'
import { prisma } from '@repo/database'

export const TIP_IDEA_RECEIPT_LENGTH = 16

export function saveTipIdea(body: string) {
  const receipt = randomBytes(12).toString('base64url').slice(0, TIP_IDEA_RECEIPT_LENGTH)

  return prisma.tipIdea.create({
    data: { body, receipt },
    select: { receipt: true },
  })
}
