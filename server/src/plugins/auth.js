import fp from 'fastify-plugin'

export default fp(async function authPlugin(fastify) {
  fastify.register(import('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    sign: { expiresIn: '7d' },
  })

  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' })
    }
  })

  fastify.decorate('requireAdmin', async function (request, reply) {
    try {
      await request.jwtVerify()
      if (request.user.role !== 'admin') {
        reply.code(403).send({ error: 'Forbidden' })
      }
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' })
    }
  })
})
