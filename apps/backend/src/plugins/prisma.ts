import { prisma, PrismaClient } from '@repo/database'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

export const PRISMA_FASTIFY_PLUGIN_NAME = 'prisma'

export default fp(
  async function prismaPlugin(fastify: FastifyInstance) {
    await prisma.$connect()
    fastify.addHook('onClose', async () => {
      await prisma.$disconnect()
    })
    fastify.decorate(PRISMA_FASTIFY_PLUGIN_NAME, prisma)
  },
  { name: PRISMA_FASTIFY_PLUGIN_NAME },
)
