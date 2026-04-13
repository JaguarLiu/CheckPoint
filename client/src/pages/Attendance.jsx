import { useState, useEffect } from 'react'
import PunchButton from '../components/PunchButton.jsx'
import AttendanceCard from '../components/AttendanceCard.jsx'
import { useAttendance } from '../hooks/useAttendance.js'
import { useAuth } from '../hooks/useAuth.js'

function formatTime(dateStr) {
  const d = new Date(dateStr)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function isBeforeWorkEnd(workEndTime) {
  if (!workEndTime) return false
  const [h, m] = workEndTime.split(':').map(Number)
  const now = new Date()
  const end = new Date()
  end.setHours(h, m, 0, 0)
  return now < end
}

export default function Attendance() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isPunching, setIsPunching] = useState(false)
  const { todayRecord, isLoading, clockIn, clockOut } = useAttendance()
  const { user } = useAuth()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hasPunchedIn = Boolean(todayRecord?.punchIn)
  const hasPunchedOut = Boolean(todayRecord?.punchOut)
  const beforeWorkEnd = isBeforeWorkEnd(user?.company?.workEndTime)

  const canClockOut = hasPunchedIn && (!hasPunchedOut || (hasPunchedOut && beforeWorkEnd))
  const isClockedIn = canClockOut

  const status = todayRecord?.status || ''
  const isLate = status.includes('late')
  const isEarlyLeave = status.includes('early_leave')

  const history = []
  if (todayRecord?.punchOut) {
    history.push({
      id: 'out',
      type: 'out',
      time: formatTime(todayRecord.punchOut),
      note: isEarlyLeave ? '辛苦了，早退！' : '準時完成，棒棒！',
      borderColor: '#f97316',
      isAlert: isEarlyLeave,
      rotate: '-1.5deg',
    })
  }
  if (todayRecord?.punchIn) {
    history.push({
      id: 'in',
      type: 'in',
      time: formatTime(todayRecord.punchIn),
      note: isLate ? '今天遲到了呢～' : '加油，開始工作！',
      borderColor: '#fbbf24',
      isAlert: isLate,
      rotate: '1.2deg',
    })
  }

  const isCompleted = hasPunchedIn && hasPunchedOut && !beforeWorkEnd

  async function handleClockAction() {
    if (isPunching || isCompleted) return
    setIsPunching(true)

    try {
      // 等待卡片插入動畫
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (canClockOut) {
        await clockOut()
      } else {
        await clockIn(null, null)
      }
    } catch (err) {
      const msg = err?.info?.error || err?.info?.message || err?.message || '打卡失敗，請稍後再試'
      alert(msg)
    } finally {
      setIsPunching(false)
    }
  }

  return (
    <div className="animate-in fade-in zoom-in duration-300">
      <section className="relative flex flex-col items-center justify-center py-12 w-full z-10">
        <PunchButton
          isClockedIn={isClockedIn}
          isCompleted={isCompleted}
          isPunching={isPunching}
          currentTime={currentTime}
          empNo={user?.empNo}
          onClick={handleClockAction}
        />
      </section>

      {/* 今日動態 */}
      <div className="mt-4 px-2 pb-10">
        <div className="flex items-center gap-2 mb-6 px-4">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <h3 className="font-black text-slate-500 text-xs uppercase tracking-[0.2em]">Today&apos;s Activity</h3>
        </div>

        {isLoading ? (
          <p className="text-center text-slate-400 text-xs py-8">載入中...</p>
        ) : history.length === 0 ? (
          <p className="text-center text-slate-400 text-xs py-8">今天還沒有打卡紀錄</p>
        ) : (
          <div className="flex flex-col items-center">
            {history.map((item) => (
              <AttendanceCard
                key={item.id}
                type={item.type}
                time={item.time}
                note={item.note}
                borderColor={item.borderColor}
                isAlert={item.isAlert}
                rotate={item.rotate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
