import 'server-only'

import { randomBytes } from 'node:crypto'
import { prisma } from '@repo/database'

export const TIP_IDEA_RECEIPT_LENGTH = 16
export const TIP_IDEA_RECEIPT_PATTERN = /^[A-Za-z0-9_-]{16}$/

export type TipIdeaPublicStatus = 'heard' | 'trying_it' | 'shipped'

export function saveTipIdea(body: string) {
  const receipt = randomBytes(12).toString('base64url').slice(0, TIP_IDEA_RECEIPT_LENGTH)

  return prisma.tipIdea.create({
    data: { body, receipt },
    select: { receipt: true },
  })
}

export function findTipIdeaStatus(receipt: string) {
  return prisma.tipIdea.findUnique({
    where: { receipt },
    select: { shipped_href: true, status: true },
  })
}
