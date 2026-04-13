import Fastify from 'fastify'
import cors from '@fastify/cors'
import prismaPlugin from './plugins/prisma.js'
import authPlugin from './plugins/auth.js'
import authRoutes from './routes/auth.js'
import attendanceRoutes from './routes/attendance.js'
import correctionRoutes from './routes/correction.js'
import adminRoutes from './routes/admin.js'
import leaveRoutes from './routes/leave.js'

const fastify = Fastify({ logger: true })

// Plugins
await fastify.register(cors, {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
})
await fastify.register(prismaPlugin)
await fastify.register(authPlugin)

// Routes
await fastify.register(authRoutes)
await fastify.register(attendanceRoutes)
await fastify.register(correctionRoutes)
await fastify.register(adminRoutes)
await fastify.register(leaveRoutes)

// Health check
fastify.get('/api/health', async () => ({ status: 'ok' }))

// Start
const PORT = process.env.PORT || 3000

try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
