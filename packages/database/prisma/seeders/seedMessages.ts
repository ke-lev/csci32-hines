import { MessageKind, type PrismaClient } from '@prisma/client'

export async function seedMessages(prisma: PrismaClient) {
  const users = await prisma.user.findMany({
    where: { email: { in: ['admin@example.com', 'basic@example.com'] } },
    select: { email: true, user_id: true },
  })
  const userByEmail = new Map(users.map((user) => [user.email, user.user_id]))
  const adminId = userByEmail.get('admin@example.com')
  const basicId = userByEmail.get('basic@example.com')

  if (!adminId || !basicId) {
    console.warn('⚠️ Seed users not found. Skipping room message seed.')
    return
  }

  const messages = [
    {
      message_id: 'seed-room-open',
      body: 'the room is open',
      kind: MessageKind.system,
      user_id: null,
      created_at: new Date('2026-01-01T12:00:00.000Z'),
    },
    {
      message_id: 'seed-room-welcome',
      body: 'hey, welcome to the room',
      kind: MessageKind.user,
      user_id: adminId,
      created_at: new Date('2026-01-01T12:01:00.000Z'),
    },
    {
      message_id: 'seed-room-reply',
      body: 'glad to be here',
      kind: MessageKind.user,
      user_id: basicId,
      created_at: new Date('2026-01-01T12:02:00.000Z'),
    },
    {
      message_id: 'seed-room-database',
      body: 'messages are now coming from the database',
      kind: MessageKind.user,
      user_id: adminId,
      created_at: new Date('2026-01-01T12:03:00.000Z'),
    },
  ]

  await prisma.$transaction(
    messages.map(({ message_id, ...data }) =>
      prisma.message.upsert({
        where: { message_id },
        update: { ...data, deleted_at: null },
        create: { message_id, ...data },
      }),
    ),
  )

  console.log(`✅ Seeded room messages: ${messages.length}`)
}
