import 'reflect-metadata'
import { Arg, Ctx, Field, ID, Int, ObjectType, Query, Resolver, registerEnumType } from 'type-graphql'
import { MessageKind } from '@repo/database'
import type { Context } from '@/utils/graphql'
import { decodeRoomCursor, encodeRoomCursor } from '@/services/room-cursor'

registerEnumType(MessageKind, {
  name: 'MessageKind',
  description: 'Whether a room line was posted by an account or emitted by a site event',
})

export const ROOM_PAGE_SIZE = 50
export const ROOM_MAX_PAGE_SIZE = 100

@ObjectType()
export class RoomMessage {
  @Field(() => ID)
  messageId!: string

  @Field(() => MessageKind)
  kind!: MessageKind

  @Field(() => String)
  body!: string

  @Field(() => String, { nullable: true })
  authorUsername?: string | null

  @Field(() => String)
  createdAt!: string

  @Field(() => String)
  cursor!: string
}

type MessageRow = {
  message_id: string
  kind: MessageKind
  body: string
  created_at: Date
  user: { username: string } | null
}

const messageSelection = {
  message_id: true,
  kind: true,
  body: true,
  created_at: true,
  user: { select: { username: true } },
} as const

function toView(row: MessageRow): RoomMessage {
  return {
    messageId: row.message_id,
    kind: row.kind,
    body: row.body,
    authorUsername: row.user?.username ?? null,
    createdAt: row.created_at.toISOString(),
    cursor: encodeRoomCursor(row.created_at, row.message_id),
  }
}

@Resolver()
export class RoomResolver {
  /**
   * Public on purpose: the room is readable without an account, which is what makes signing up
   * worth anything. Deleted lines are filtered here rather than removed, so the cursors either
   * side of a moderated line keep resolving.
   */
  @Query(() => [RoomMessage])
  async roomMessages(
    @Ctx() context: Context,
    @Arg('after', () => String, { nullable: true }) after?: string,
    @Arg('before', () => String, { nullable: true }) before?: string,
    @Arg('limit', () => Int, { nullable: true }) limit?: number,
  ): Promise<RoomMessage[]> {
    const take = Math.min(Math.max(1, limit ?? ROOM_PAGE_SIZE), ROOM_MAX_PAGE_SIZE)
    const afterCursor = decodeRoomCursor(after)
    const beforeCursor = decodeRoomCursor(before)

    // newer than a cursor: read forward, so the rows arrive oldest-first already
    if (afterCursor) {
      const rows = await context.prisma.message.findMany({
        where: {
          deleted_at: null,
          OR: [
            { created_at: { gt: afterCursor.createdAt } },
            { created_at: afterCursor.createdAt, message_id: { gt: afterCursor.messageId } },
          ],
        },
        orderBy: [{ created_at: 'asc' }, { message_id: 'asc' }],
        select: messageSelection,
        take,
      })

      return rows.map(toView)
    }

    // older than a cursor, or the newest page when there is none: read backward, then flip
    const rows = await context.prisma.message.findMany({
      where: {
        deleted_at: null,
        ...(beforeCursor
          ? {
              OR: [
                { created_at: { lt: beforeCursor.createdAt } },
                { created_at: beforeCursor.createdAt, message_id: { lt: beforeCursor.messageId } },
              ],
            }
          : {}),
      },
      orderBy: [{ created_at: 'desc' }, { message_id: 'desc' }],
      select: messageSelection,
      take,
    })

    return rows.reverse().map(toView)
  }
}
