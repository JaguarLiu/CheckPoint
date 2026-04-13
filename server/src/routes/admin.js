import { localTimeToUTC } from '../utils/timezone.js'

export default async function adminRoutes(fastify) {
  fastify.addHook('onRequest', fastify.requireAdmin)

  // GET /api/admin/attendance?month=2024-02
  fastify.get('/api/admin/attendance', async (request) => {
    const { month } = request.query

    let year, mon
    if (month) {
      ;[year, mon] = month.split('-').map(Number)
    } else {
      const now = new Date()
      year = now.getFullYear()
      mon = now.getMonth() + 1
    }

    const startDate = new Date(Date.UTC(year, mon - 1, 1))
    const endDate = new Date(Date.UTC(year, mon, 1))

    const records = await fastify.prisma.attendanceRecord.findMany({
      where: {
        workDate: { gte: startDate, lt: endDate },
      },
      include: {
        user: { select: { id: true, email: true, name: true, empNo: true } },
      },
    })

    // 按 user 分組統計
    const userMap = new Map()
    for (const r of records) {
      const uid = r.userId
      if (!userMap.has(uid)) {
        userMap.set(uid, {
          user: r.user,
          totalWorkDuration: 0,
          attendanceDays: 0,
          lateDays: 0,
          earlyLeaveDays: 0,
        })
      }
      const stat = userMap.get(uid)
      if (r.workDuration) stat.totalWorkDuration += r.workDuration
      if (r.punchIn) stat.attendanceDays += 1
      if (r.status && r.status.includes('late')) stat.lateDays += 1
      if (r.status && r.status.includes('early_leave')) stat.earlyLeaveDays += 1
    }

    return Array.from(userMap.values())
  })

  // PATCH /api/admin/attendance/:id
  fastify.patch('/api/admin/attendance/:id', async (request) => {
    const { id } = request.params
    const { status } = request.body

    const record = await fastify.prisma.attendanceRecord.update({
      where: { id },
      data: { status },
    })

    return record
  })

  // PATCH /api/admin/correction-requests/:id
  fastify.patch('/api/admin/correction-requests/:id', async (request) => {
    const { id } = request.params
    const { status } = request.body

    const correction = await fastify.prisma.correctionRequest.findUnique({
      where: { id },
      include: { attendance: { include: { user: true } } },
    })

    if (!correction) {
      return request.server.httpErrors.notFound('找不到該補卡申請')
    }

    // 審核通過時，解析 reason 並更新 attendanceRecord
    if (status === 'approved') {
      const match = correction.reason.match(/^\[(.+?)\]\s*(\d{1,2}:\d{2})\s*-/)
      if (match) {
        const type = match[1] // '上班' or '下班'
        const timeStr = match[2]
        const workDate = new Date(correction.attendance.workDate)
        const dateStr = workDate.toISOString().split('T')[0]
        // 用申請者的時區建構正確的 UTC 時間
        const timezone = correction.attendance.user?.timezone || 'Asia/Taipei'
        const correctedTime = localTimeToUTC(dateStr, timeStr, timezone)

        const updateData = type === '上班'
          ? { punchIn: correctedTime }
          : { punchOut: correctedTime }

        // 如果同時有上下班時間，重新計算工時
        const attendance = correction.attendance
        const punchIn = type === '上班' ? correctedTime : attendance.punchIn
        const punchOut = type === '下班' ? correctedTime : attendance.punchOut
        if (punchIn && punchOut) {
          updateData.workDuration = Math.round((punchOut - punchIn) / 1000 / 60)
        }

        await fastify.prisma.attendanceRecord.update({
          where: { id: correction.attendanceId },
          data: updateData,
        })
      }
    }

    const updated = await fastify.prisma.correctionRequest.update({
      where: { id },
      data: { status },
    })

    return updated
  })

  // GET /api/admin/correction-requests
  fastify.get('/api/admin/correction-requests', async (request) => {
    const { status } = request.query

    const where = status ? { status } : {}

    const records = await fastify.prisma.correctionRequest.findMany({
      where,
      include: {
        attendance: {
          include: {
            user: { select: { id: true, email: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return records
  })
}
