import { UserResolver } from '@/resolvers/UserResolver'
import { TipIdeaResolver } from '@/resolvers/TipIdeaResolver'
import { PersonalPageResolver } from '@/resolvers/PersonalPageResolver'
import { buildSchema, registerEnumType } from 'type-graphql'
import type { NonEmptyArray } from 'type-graphql'
import type { FastifyBaseLogger, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { PermissionName, PrismaClient, RoleName } from '@repo/database'
import { getBooleanEnvVar } from '@/utils'
import type { CurrentUser, UserService } from '@/services/UserService'
import { normalizeUsername } from '@/services/auth-validation'
import { verifyToken, type AuthTokenPayload } from './auth'
import { customAuthChecker } from './authChecker'
import { forbiddenError, unauthenticatedError } from './auth-errors'
import mercurius from 'mercurius'
import mercuriusLogging from 'mercurius-logging'
const GRAPHQL_API_PATH = '/api/graphql'
const GRAPHQL_DEPTH_LIMIT = 7

registerEnumType(PermissionName, {
  name: 'PermissionName',
  description: 'Enum representing valid permissions for authorization',
})

registerEnumType(RoleName, {
  name: 'RoleName',
  description: 'Enum representing valid roles for users',
})

const resolvers: NonEmptyArray<typeof UserResolver | typeof TipIdeaResolver | typeof PersonalPageResolver> = [
  UserResolver,
  TipIdeaResolver,
  PersonalPageResolver,
]

export interface Context {
  request: FastifyRequest
  reply: FastifyReply
  userService: UserService
  prisma: PrismaClient
  auth: AuthTokenPayload | null
  currentUser: CurrentUser | null
  log: FastifyBaseLogger
}

function getBearerToken(authorization: string | undefined) {
  const match = authorization?.match(/^Bearer\s+(.+)$/i)
  return match?.[1]
}

export function requireCurrentUser(context: Pick<Context, 'currentUser'>): CurrentUser {
  if (!context.currentUser) {
    throw unauthenticatedError()
  }

  return context.currentUser
}

export function requireSiteOwner(context: Pick<Context, 'currentUser'>): CurrentUser {
  const currentUser = requireCurrentUser(context)
  const ownerUsername = process.env.OWNER_USERNAME

  if (!ownerUsername || normalizeUsername(ownerUsername) !== currentUser.username) {
    throw forbiddenError()
  }

  return currentUser
}

export async function registerGraphQL(fastify: FastifyInstance) {
  const schema = await buildSchema({
    resolvers,
    authChecker: customAuthChecker,
  })
  const graphiql = getBooleanEnvVar('ENABLE_GRAPHIQL', false)
  fastify.log.info(`GraphiQL is ${graphiql ? 'enabled' : 'disabled'}`)
  const options = {
    schema,
    cache: false,
    path: GRAPHQL_API_PATH,
    graphiql,
    queryDepth: GRAPHQL_DEPTH_LIMIT,
    context: async (request: FastifyRequest, reply: FastifyReply): Promise<Context> => {
      const token = getBearerToken(request.headers.authorization)
      const auth = token ? verifyToken(token) : null
      const currentUser = auth?.sub ? await fastify.userService.findById(auth.sub) : null

      return {
        auth,
        currentUser,
        log: fastify.log,
        prisma: fastify.prisma,
        reply,
        request,
        userService: fastify.userService,
      }
    },
    allowBatchedQueries: false,
  }
  await fastify.register(mercurius, options)
  // never on: this endpoint carries signUp/signIn, so a logged body or variable set is a
  // plaintext password in the logs. redact before turning either of these back on.
  await fastify.register(mercuriusLogging, {
    prependAlias: true,
    logBody: false,
    logVariables: false,
  })
}
