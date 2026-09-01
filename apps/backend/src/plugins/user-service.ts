import { UserService } from '@/services/UserService'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { PRISMA_FASTIFY_PLUGIN_NAME } from './prisma'

declare module 'fastify' {
  interface FastifyInstance {
    userService: UserService
  }
}

export const USER_SERVICE_FASTIFY_PLUGIN_NAME = 'userService'

export default fp(
  async function userServicePlugin(fastify: FastifyInstance) {
    const userService = new UserService({ prisma: fastify.prisma })
    fastify.decorate(USER_SERVICE_FASTIFY_PLUGIN_NAME, userService)
  },
  { name: USER_SERVICE_FASTIFY_PLUGIN_NAME, dependencies: [PRISMA_FASTIFY_PLUGIN_NAME] },
)
