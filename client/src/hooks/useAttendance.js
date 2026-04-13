import useSWR from 'swr'
import { useEffect } from 'react'
import { fetcher, punchIn, punchOut } from '../services/api.js'

export function useAttendance() {
  const { data, error, isLoading, mutate } = useSWR('/attendance/today', fetcher, {
    refreshInterval: 10 * 60 * 1000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

  // 頁面從背景回到前景時強制重新取得
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        mutate()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [mutate])

  async function clockIn(gpsLat, gpsLng) {
    const result = await punchIn(gpsLat, gpsLng)
    mutate(result, { revalidate: true })
  }

  async function clockOut() {
    const result = await punchOut()
    mutate(result, { revalidate: true })
  }

  return {
    todayRecord: data ?? null,
    isLoading,
    error,
    clockIn,
    clockOut,
    refresh: mutate,
  }
}

export function useAttendanceHistory(params = {}) {
  const query = new URLSearchParams(params).toString()
  const { data, error, isLoading } = useSWR(`/attendance?${query}`, fetcher)

  return {
    records: data ?? [],
    isLoading,
    error,
  }
}
