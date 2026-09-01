import { UserResolver } from '@/resolvers/UserResolver'
import { buildSchema } from 'type-graphql'
import type { NonEmptyArray } from 'type-graphql'
import type { FastifyBaseLogger, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@repo/database'
import { getBooleanEnvVar, getRequiredStringEnvVar } from '@/utils'
import type { UserService } from '@/services/UserService'
import mercurius from 'mercurius'
import mercuriusLogging from 'mercurius-logging'
const GRAPHQL_API_PATH = '/api/graphql'
const GRAPHQL_DEPTH_LIMIT = 7

const resolvers = [UserResolver] as NonEmptyArray<Function>

export interface Context {
  request: FastifyRequest
  reply: FastifyReply
  userService: UserService
  prisma: PrismaClient
  log: FastifyBaseLogger
}

export async function registerGraphQL(fastify: FastifyInstance) {
  const schema = await buildSchema({
    resolvers,
  })
  const graphiql = getBooleanEnvVar('ENABLE_GRAPHIQL', false)
  fastify.log.info(`GraphiQL is ${graphiql ? 'enabled' : 'disabled'}`)
  const options = {
    schema,
    cache: false,
    path: GRAPHQL_API_PATH,
    graphiql,
    queryDepth: GRAPHQL_DEPTH_LIMIT,
    context: (request: FastifyRequest, reply: FastifyReply): Context => ({
      request,
      reply,
      userService: fastify.userService,
      prisma: fastify.prisma,
      log: fastify.log,
    }),
    allowBatchedQueries: false,
  }
  await fastify.register(mercurius, options)
  await fastify.register(mercuriusLogging, {
    prependAlias: true,
    logBody: true,
    logVariables: getRequiredStringEnvVar('NODE_ENV') === 'development',
  })
}
