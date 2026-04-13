import { dateStrToDate } from '../utils/timezone.js'

export default async function leaveRoutes(fastify) {
  fastify.addHook('onRequest', fastify.authenticate)

  // POST /api/leave-requests
  fastify.post('/api/leave-requests', async (request, reply) => {
    const { leaveType, startDate, startTime, endDate, endTime, reason } = request.body

    if (!leaveType || !startDate || !startTime || !endDate || !endTime) {
      return reply.code(400).send({ error: '請填寫所有必填欄位' })
    }

    if (startDate > endDate || (startDate === endDate && startTime >= endTime)) {
      return reply.code(400).send({ error: '結束時間必須晚於開始時間' })
    }

    const leave = await fastify.prisma.leaveRequest.create({
      data: {
        userId: request.user.id,
        leaveType,
        startDate: dateStrToDate(startDate),
        startTime,
        endDate: dateStrToDate(endDate),
        endTime,
        reason: reason || null,
        status: 'pending',
      },
    })

    return leave
  })

  // GET /api/leave-requests
  fastify.get('/api/leave-requests', async (request) => {
    const records = await fastify.prisma.leaveRequest.findMany({
      where: { userId: request.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return records
  })
}
