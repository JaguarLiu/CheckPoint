const API_BASE = import.meta.env.VITE_API_BASE || '/api'

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const config = {
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...options,
  }

  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(url, config)
  if (!res.ok) {
    const error = new Error('API request failed')
    error.status = res.status
    const info = await res.json().catch(() => null)
    error.info = info
    error.message = info?.error || info?.message || 'API request failed'
    throw error
  }
  return res.json()
}

export function punchIn(gpsLat, gpsLng) {
  return request('/punch-in', {
    method: 'POST',
    body: JSON.stringify({ gps_lat: gpsLat, gps_lng: gpsLng }),
  })
}

export function punchOut() {
  return request('/punch-out', {
    method: 'POST',
  })
}

export function getAttendanceRecords(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/attendance?${query}`)
}

export function submitCorrectionRequest({ workDate, time, type, reason }) {
  return request('/correction-requests', {
    method: 'POST',
    body: JSON.stringify({ workDate, time, type, reason }),
  })
}

export function getAdminAttendanceList(month) {
  return request(`/admin/attendance?month=${month}`)
}

export function reviewCorrectionRequest(requestId, status) {
  return request(`/admin/correction-requests/${requestId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function submitLeaveRequest({ leaveType, startDate, startTime, endDate, endTime, reason }) {
  return request('/leave-requests', {
    method: 'POST',
    body: JSON.stringify({ leaveType, startDate, startTime, endDate, endTime, reason }),
  })
}

export function getLeaveRequests() {
  return request('/leave-requests')
}

export const fetcher = (url) => request(url)
