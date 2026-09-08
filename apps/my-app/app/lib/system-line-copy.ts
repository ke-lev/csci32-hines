import type { DrawingKindName } from '../input/guestbook-name'

export function guestbookSystemLine(seed: string, kind: DrawingKindName) {
  return kind === 'cat' ? `${seed} signed the guestbook as a cat` : `${seed} signed the guestbook`
}
