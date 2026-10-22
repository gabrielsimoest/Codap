import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'
import { type FastifyRequest } from 'fastify'

/**
 * Registers @fastify/jwt (used to sign/verify access tokens) and exposes a
 * reusable `fastify.authenticate` preHandler for any protected route.
 */
export default fp(async (fastify) => {
  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET não está definido. Configure-o no .env (ver .env.example).')
  }

  await fastify.register(jwt, { secret })

  fastify.decorate('authenticate', async function (request: FastifyRequest) {
    try {
      await request.jwtVerify()
    } catch {
      throw fastify.httpErrors.unauthorized('Token de acesso inválido ou expirado.')
    }
  })
})

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string };
    user: { id: string };
  }
}
