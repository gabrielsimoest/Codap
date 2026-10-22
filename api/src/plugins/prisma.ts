import fp from 'fastify-plugin'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'

/**
 * This plugin connects to the database via Prisma and exposes it
 * to the rest of the application through the `prisma` decorator.
 *
 * @see https://www.prisma.io/docs/orm/overview/databases/postgresql
 */
export default fp(async (fastify) => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  fastify.decorate('prisma', prisma)

  fastify.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect()
  })
})

declare module 'fastify' {
  export interface FastifyInstance {
    prisma: InstanceType<typeof PrismaClient>;
  }
}
