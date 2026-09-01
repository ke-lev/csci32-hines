import 'reflect-metadata'
import dotenv from 'dotenv'
import Fastify from 'fastify'
import { fileURLToPath } from 'node:url'
import autoLoad from '@fastify/autoload'
import { dirname, join } from 'node:path'
import { registerGraphQL } from './utils/graphql'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config()
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

void fastify.register(autoLoad, {
  dir: join(__dirname, 'plugins'),
  forceESM: true,
})

const start = async () => {
  try {
    await registerGraphQL(fastify)
    await fastify.listen({ port: 4000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
