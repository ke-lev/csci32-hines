import { MessageKind, type PrismaClient } from '@repo/database'
import { GraphQLError } from 'graphql'
import { validateMessageBody } from './message-validation'
import { checkRateLimit } from '../utils/rate-limit'

const POSTS_PER_WINDOW = 10
const WINDOW_MS = 60_000

export type CreateMessageInput = {
  body: string
}

export const messageSelection = {
  message_id: true,
  kind: true,
  body: true,
  created_at: true,
  user: { select: { username: true } },
} as const

export interface MessageServiceProps {
  prisma: PrismaClient
}

export class MessageService {
  constructor(private readonly deps: MessageServiceProps) {}

  async createForUser(input: CreateMessageInput, userId: string) {
    const validation = validateMessageBody(input.body)

    if (!validation.ok) {
      throw new GraphQLError(validation.reason, { extensions: { code: 'BAD_USER_INPUT' } })
    }

    const limit = checkRateLimit({ key: userId, limit: POSTS_PER_WINDOW, windowMs: WINDOW_MS })

    if (!limit.allowed) {
      throw new GraphQLError(`slow down - try again in ${Math.ceil(limit.retryAfterMs / 1000)}s`, {
        extensions: { code: 'BAD_USER_INPUT' },
      })
    }

    return this.deps.prisma.message.create({
      data: { body: validation.value, kind: MessageKind.user, user_id: userId },
      select: messageSelection,
    })
  }
}
