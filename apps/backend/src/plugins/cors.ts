import fp from 'fastify-plugin'
import cors from '@fastify/cors'
import { getRequiredStringEnvVar } from '@/utils'

function getCorsOrigins() {
  const origins = getRequiredStringEnvVar('CORS_ORIGIN')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  if (origins.length === 0) {
    throw new Error('CORS_ORIGIN must contain at least one origin')
  }

  return origins
}

export default fp(async (fastify) => {
  await fastify.register(cors, {
    origin: getCorsOrigins(),
  })
})
