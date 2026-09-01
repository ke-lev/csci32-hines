import fp from 'fastify-plugin'
import cors from '@fastify/cors'
import { getRequiredStringEnvVar } from '@/utils'

export default fp(async (fastify) => {
  await fastify.register(cors, {
    origin: [getRequiredStringEnvVar('CORS_ORIGIN')],
  })
})
