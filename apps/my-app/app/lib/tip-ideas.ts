import 'server-only'

import { prisma } from '@repo/database'

export function saveTipIdea(body: string) {
  return prisma.tipIdea.create({ data: { body } })
}
