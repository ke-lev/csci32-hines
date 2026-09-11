import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@repo/database'
import { MessageKind } from '@repo/database'
import { MessageService, messageSelection } from '../../backend/src/services/MessageService'
import { resetRateLimits } from '../../backend/src/utils/rate-limit'

describe('MessageService', () => {
  beforeEach(() => {
    resetRateLimits()
  })

  it('normalizes the body and assigns ownership from the trusted user id', async () => {
    const create = vi.fn().mockResolvedValue({ message_id: 'message-1' })
    const prisma = { message: { create } } as unknown as PrismaClient
    const service = new MessageService({ prisma })

    await expect(service.createForUser({ body: '  hello\nroom  ' }, 'user-1')).resolves.toEqual({
      message_id: 'message-1',
    })
    expect(create).toHaveBeenCalledWith({
      data: { body: 'hello room', kind: MessageKind.user, user_id: 'user-1' },
      select: messageSelection,
    })
  })

  it('rejects an invalid body before writing to the database', async () => {
    const create = vi.fn()
    const prisma = { message: { create } } as unknown as PrismaClient
    const service = new MessageService({ prisma })

    await expect(service.createForUser({ body: '   ' }, 'user-1')).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    })
    expect(create).not.toHaveBeenCalled()
  })

  it('enforces the posting limit before writing an eleventh message', async () => {
    const create = vi.fn().mockResolvedValue({ message_id: 'message-1' })
    const prisma = { message: { create } } as unknown as PrismaClient
    const service = new MessageService({ prisma })

    for (let attempt = 0; attempt < 10; attempt += 1) {
      await service.createForUser({ body: `message ${attempt}` }, 'user-1')
    }

    await expect(service.createForUser({ body: 'one too many' }, 'user-1')).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    })
    expect(create).toHaveBeenCalledTimes(10)
  })
})
