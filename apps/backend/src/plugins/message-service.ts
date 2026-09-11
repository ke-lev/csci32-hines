import { MessageService } from '@/services/MessageService'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { PRISMA_FASTIFY_PLUGIN_NAME } from './prisma'

declare module 'fastify' {
  interface FastifyInstance {
    messageService: MessageService
  }
}

export const MESSAGE_SERVICE_FASTIFY_PLUGIN_NAME = 'messageService'

export default fp(
  async function messageServicePlugin(fastify: FastifyInstance) {
    const messageService = new MessageService({ prisma: fastify.prisma })
    fastify.decorate(MESSAGE_SERVICE_FASTIFY_PLUGIN_NAME, messageService)
  },
  { name: MESSAGE_SERVICE_FASTIFY_PLUGIN_NAME, dependencies: [PRISMA_FASTIFY_PLUGIN_NAME] },
)
