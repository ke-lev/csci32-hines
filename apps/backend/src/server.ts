import Fastify from 'fastify'
import { registerGraphQL } from './utils/graphql'
import corsPlugin from './plugins/cors'
import prismaPlugin from './plugins/prisma'
import sensiblePlugin from './plugins/sensible'
import userServicePlugin from './plugins/user-service'

const fastify = Fastify({
  logger:
    process.env.NODE_ENV === 'development'
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          },
        }
      : true,
})

// Explicit imports let Vercel trace and compile every plugin into the function.
void fastify.register(corsPlugin)
void fastify.register(prismaPlugin)
void fastify.register(sensiblePlugin)
void fastify.register(userServicePlugin)

const start = async () => {
  try {
    await registerGraphQL(fastify)
    // 0.0.0.0 so a platform load balancer (Railway/Render/etc.) can reach the server: the
    // platform injects PORT and routes to it. locally PORT is unset, so this stays on 4000.
    const port = Number(process.env.PORT ?? 4000)
    await fastify.listen({ port, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
