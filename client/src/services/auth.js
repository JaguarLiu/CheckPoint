const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export async function loginWithGoogle(credential) {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  })

  if (!res.ok) {
    throw new Error('Login failed')
  }

  const data = await res.json()
  localStorage.setItem('auth_token', data.token)
  return data.user
}

export function logout() {
  localStorage.removeItem('auth_token')
}

export function getStoredToken() {
  return localStorage.getItem('auth_token')
}

export async function getCurrentUser() {
  const token = getStoredToken()
  if (!token) return null

  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    localStorage.removeItem('auth_token')
    return null
  }

  return res.json()
}
