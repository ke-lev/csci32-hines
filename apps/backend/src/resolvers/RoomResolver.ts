import 'reflect-metadata'
import { Arg, Authorized, Ctx, Field, ID, Int, Mutation, ObjectType, Query, Resolver, registerEnumType } from 'type-graphql'
import { MessageKind, PermissionName } from '@repo/database'
import type { Context } from '@/utils/graphql'
import { requireCurrentUser } from '@/utils/graphql'
import { decodeRoomCursor, encodeRoomCursor } from '@/services/room-cursor'
import { validateMessageBody } from '@/services/message-validation'
import { checkRateLimit } from '@/utils/rate-limit'
import { GraphQLError } from 'graphql'

registerEnumType(MessageKind, {
  name: 'MessageKind',
  description: 'Whether a room line was posted by an account or emitted by a site event',
})

export const ROOM_PAGE_SIZE = 50
export const ROOM_MAX_PAGE_SIZE = 100
const POSTS_PER_WINDOW = 10
const WINDOW_MS = 60_000

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

  /**
   * The room's only write path. The body is normalized server-side, and the rate limit is keyed on
   * the account rather than the IP, because the session is the thing being spent here.
   */
  @Mutation(() => RoomMessage)
  async postMessage(@Ctx() context: Context, @Arg('body', () => String) body: string): Promise<RoomMessage> {
    const currentUser = requireCurrentUser(context)
    const validation = validateMessageBody(body)

    if (!validation.ok) {
      throw new GraphQLError(validation.reason, { extensions: { code: 'BAD_USER_INPUT' } })
    }

    const limit = checkRateLimit({ key: currentUser.user_id, limit: POSTS_PER_WINDOW, windowMs: WINDOW_MS })

    if (!limit.allowed) {
      throw new GraphQLError(`slow down - try again in ${Math.ceil(limit.retryAfterMs / 1000)}s`, {
        extensions: { code: 'BAD_USER_INPUT' },
      })
    }

    const row = await context.prisma.message.create({
      data: { body: validation.value, kind: MessageKind.user, user_id: currentUser.user_id },
      select: messageSelection,
    })

    return toView(row)
  }

  /**
   * Soft delete: the row stays so the cursors either side of it keep resolving, and the read query
   * filters it out. This is the first real job the Admin role has had.
   */
  @Authorized(PermissionName.UserWrite)
  @Mutation(() => Boolean)
  async deleteMessage(@Ctx() context: Context, @Arg('messageId', () => ID) messageId: string): Promise<boolean> {
    const updated = await context.prisma.message.updateMany({
      where: { message_id: messageId, deleted_at: null },
      data: { deleted_at: new Date() },
    })

    return updated.count > 0
  }
}
