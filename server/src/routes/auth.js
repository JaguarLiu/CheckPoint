export default async function authRoutes(fastify) {
  // POST /api/auth/google
  fastify.post('/api/auth/google', async (request, reply) => {
    const { credential } = request.body

    if (!credential) {
      return reply.code(400).send({ error: '缺少 credential' })
    }

    // 用 access_token 向 Google 取得用戶資料
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${credential}` },
    })

    if (!googleRes.ok) {
      return reply.code(401).send({ error: 'Google 驗證失敗' })
    }

    const profile = await googleRes.json()
    const { email, name, picture } = profile

    if (!email) {
      return reply.code(401).send({ error: '無法取得 Google 帳號 email' })
    }

    // 查找用戶，不存在則拋出錯誤
    let user = await fastify.prisma.user.findUnique({ where: { email } })
    if (!user) {
      return reply.code(403).send({ error: '帳戶不存在，請聯絡管理員' })
    }

    if (name || picture) {
      user = await fastify.prisma.user.update({
        where: { email },
        data: {
          ...(name && { name }),
          ...(picture && { avatar: picture }),
        },
      })
    }

    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    return { token, user }
  })

  // GET /api/auth/me
  fastify.get('/api/auth/me', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user.id },
      include: { company: true },
    })
    return user
  })
}
