import { getTodayStart, parseTimeToday } from '../utils/timezone.js'

export default async function attendanceRoutes(fastify) {
  fastify.addHook('onRequest', fastify.authenticate)

  // GET /api/attendance/today
  fastify.get('/api/attendance/today', async (request) => {
    const today = getTodayStart()

    const record = await fastify.prisma.attendanceRecord.findUnique({
      where: {
        userId_workDate: {
          userId: request.user.id,
          workDate: today,
        },
      },
    })

    return record
  })

  // POST /api/punch-in
  fastify.post('/api/punch-in', async (request, reply) => {
    const { gps_lat, gps_lng } = request.body || {}
    const today = getTodayStart()
    const now = new Date()

    const existing = await fastify.prisma.attendanceRecord.findUnique({
      where: { userId_workDate: { userId: request.user.id, workDate: today } },
    })

    if (existing?.punchIn) {
      return reply.code(400).send({ error: '今日已打過上班卡' })
    }

    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user.id },
      include: { company: true },
    })

    let status = 'normal'
    if (user?.company?.workStartTime) {
      const workStart = parseTimeToday(user.company.workStartTime)
      if (now > workStart) {
        status = 'late'
      }
    }

    const record = await fastify.prisma.attendanceRecord.upsert({
      where: { userId_workDate: { userId: request.user.id, workDate: today } },
      update: { punchIn: now, gpsLat: gps_lat, gpsLng: gps_lng, status },
      create: {
        userId: request.user.id,
        workDate: today,
        punchIn: now,
        gpsLat: gps_lat,
        gpsLng: gps_lng,
        status,
      },
    })

    return record
  })

  // POST /api/punch-out
  fastify.post('/api/punch-out', async (request, reply) => {
    const today = getTodayStart()
    const now = new Date()

    const record = await fastify.prisma.attendanceRecord.findUnique({
      where: { userId_workDate: { userId: request.user.id, workDate: today } },
    })

    if (!record?.punchIn) {
      return reply.code(400).send({ error: '尚未打上班卡' })
    }

    if (record.punchOut && now <= record.punchOut) {
      return record
    }

    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user.id },
      include: { company: true },
    })

    const punchOut = now
    const workDuration = Math.round((punchOut - record.punchIn) / 1000 / 60)

    let status = record.status
    const company = user?.company
    if (company?.workEndTime) {
      const workEnd = parseTimeToday(company.workEndTime)
      const isEarlyLeave = punchOut < workEnd
      const isLate = status === 'late'

      if (isEarlyLeave && isLate) {
        status = 'late_and_early_leave'
      } else if (isEarlyLeave) {
        status = 'early_leave'
      } else if (isLate) {
        status = 'late'
      } else {
        status = 'completed'
      }
    } else {
      status = record.status === 'late' ? 'late' : 'completed'
    }

    const updated = await fastify.prisma.attendanceRecord.update({
      where: { id: record.id },
      data: { punchOut, workDuration, status },
    })

    return updated
  })

  // GET /api/attendance?month=2026-02
  fastify.get('/api/attendance', async (request) => {
    const { month } = request.query
    let where = { userId: request.user.id }

    if (month) {
      const [year, m] = month.split('-').map(Number)
      const start = new Date(year, m - 1, 1)
      const end = new Date(year, m, 1)
      where.workDate = { gte: start, lt: end }
    }

    const records = await fastify.prisma.attendanceRecord.findMany({
      where,
      orderBy: { workDate: 'desc' },
    })

    return records
  })
}
