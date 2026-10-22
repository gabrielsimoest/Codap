import fp from 'fastify-plugin'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'

/**
 * Registers Swagger/OpenAPI documentation, available at /documentation.
 * Only enabled when NODE_ENV=development — the docs routes are not
 * registered at all outside of dev, so they don't exist in production.
 */
export default fp(async (fastify) => {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Codap API',
        description: 'API do Codap — aplicativo de aprendizado de HTML, CSS e JavaScript.',
        version: '1.0.0'
      }
    }
  })

  await fastify.register(swaggerUI, {
    routePrefix: '/documentation'
  })
})
