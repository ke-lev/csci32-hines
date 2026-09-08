import { MessageKind, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Gives the room real history on the day it ships. The timestamps are the guestbook's own, so
 * nothing here invents activity. Safe to re-run: it skips any signature already announced.
 */
async function main() {
  const entries = await prisma.guestbookEntry.findMany({
    orderBy: [{ created_at: 'asc' }, { entry_id: 'asc' }],
    select: { created_at: true, kind: true, seed: true },
  })

  let written = 0

  for (const entry of entries) {
    const body =
      entry.kind === 'cat' ? `${entry.seed} signed the guestbook as a cat` : `${entry.seed} signed the guestbook`

    const already = await prisma.message.findFirst({
      select: { message_id: true },
      where: { body, kind: MessageKind.system },
    })

    if (already) continue

    await prisma.message.create({ data: { body, created_at: entry.created_at, kind: MessageKind.system } })
    written += 1
  }

  console.log(`wrote ${written} system lines from ${entries.length} guestbook entries`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
