/**
 * 取得今天日期（UTC，給 @db.Date 欄位用）
 */
export function getTodayStart() {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

/**
 * 將 YYYY-MM-DD 字串轉為 UTC Date（給 @db.Date 欄位用）
 */
export function dateStrToDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

/**
 * 將 "HH:mm" 轉為今天該時刻的本地 Date（用於時間比較）
 */
export function parseTimeToday(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0)
}

/**
 * 將 YYYY-MM-DD 日期 + HH:mm 時間 + 時區，轉為正確的 UTC Date
 * 用於把用戶填寫的本地時間存入 DB
 */
export function localTimeToUTC(dateStr, timeStr, timezone) {
  const ref = new Date(`${dateStr}T12:00:00Z`)
  const utc = new Date(ref.toLocaleString('en-US', { timeZone: 'UTC' }))
  const local = new Date(ref.toLocaleString('en-US', { timeZone: timezone }))
  const offsetMs = local - utc
  const [h, m] = timeStr.split(':').map(Number)
  const localMs = new Date(`${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00Z`).getTime()
  return new Date(localMs - offsetMs)
}
