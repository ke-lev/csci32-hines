import 'server-only'

import { MessageKind, prisma } from '@repo/database'
import type { DrawingKindName } from '../input/guestbook-name'
import { guestbookSystemLine } from './system-line-copy'

export { guestbookSystemLine } from './system-line-copy'

/**
 * The room's baseline content. A signature is already public, so announcing it discloses nothing
 * new - it just gives the room real history instead of an empty transcript.
 */
export async function writeGuestbookSystemLine(seed: string, kind: DrawingKindName) {
  await prisma.message.create({
    data: { body: guestbookSystemLine(seed, kind), kind: MessageKind.system },
  })
}
