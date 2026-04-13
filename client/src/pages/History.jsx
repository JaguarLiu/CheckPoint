import { useState } from 'react'
import { History as HistoryIcon, ChevronDown, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAttendanceHistory } from '../hooks/useAttendance.js'
import PaperPiece from '../components/PaperPiece.jsx'

const months = [
  '1 月', '2 月', '3 月', '4 月', '5 月', '6 月',
  '7 月', '8 月', '9 月', '10 月', '11 月', '12 月',
]

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const day = weekDays[d.getDay()]
  return `${mm}/${dd} (${day})`
}

function formatTime(dateStr) {
  if (!dateStr) return '--:--'
  const d = new Date(dateStr)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatDuration(minutes) {
  if (minutes == null) return '--'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${String(m).padStart(2, '0')}m`
}

export default function History() {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear] = useState(now.getFullYear())
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const month = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`
  const { records, isLoading } = useAttendanceHistory({ month })

  const navigate = useNavigate()

  return (
    <main className="w-full relative z-10 px-2 animate-in slide-in-from-bottom-4 duration-300 py-4">
      <button onClick={() => navigate('/profile')} className="flex items-center gap-2 mb-6 ml-4 text-slate-400 hover:text-slate-600 transition-colors font-black text-xs uppercase tracking-widest">
        <ArrowLeft size={16} /> 返回個人中心
      </button>
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-2">
          <HistoryIcon size={24} className="text-sky-500" />
          <h3 className="font-black text-2xl text-slate-700 tracking-tight">打卡紀錄</h3>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm text-[11px] font-black text-slate-500 tracking-tight flex items-center gap-1.5 hover:shadow-md transition-shadow"
          >
            {months[selectedMonth]}
            <ChevronDown size={12} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl border border-slate-100 shadow-lg py-2 z-30 w-28 max-h-52 overflow-y-auto">
              {months.map((label, index) => (
                <button
                  key={index}
                  onClick={() => { setSelectedMonth(index); setIsDropdownOpen(false) }}
                  className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors
                    ${index === selectedMonth ? 'text-sky-500 bg-sky-50' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-2 pb-10">
        <PaperPiece color="white" rotate="0.5deg" className="p-4 border-b-4 border-slate-200/50 min-h-[400px]">
          <div className="grid grid-cols-4 gap-2 mb-4 pb-2 border-b-2 border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
            <div>日期</div>
            <div>上班</div>
            <div>下班</div>
            <div className="text-right">總工時</div>
          </div>

          {isLoading ? (
            <p className="text-center text-slate-400 text-xs py-8">載入中...</p>
          ) : records.length === 0 ? (
            <p className="text-center text-slate-400 text-xs py-8">本月尚無考勤紀錄</p>
          ) : (
            <div className="flex flex-col">
              {records.map((record, index) => (
                <div
                  key={record.id}
                  className={`grid grid-cols-4 gap-2 py-4 px-2 items-center ${index !== records.length - 1 ? 'border-b border-slate-50' : ''}`}
                >
                  <div className="text-[11px] font-black text-slate-400 leading-tight">
                    {formatDate(record.workDate)}
                  </div>
                  <div className="text-sm font-black text-slate-700 font-mono">
                    {formatTime(record.punchIn)}
                  </div>
                  <div className="text-sm font-black text-slate-700 font-mono">
                    {formatTime(record.punchOut)}
                  </div>
                  <div className="text-xs font-black text-emerald-600 text-right font-mono bg-emerald-50 px-1 py-1 rounded">
                    {formatDuration(record.workDuration)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </PaperPiece>
      </div>
    </main>
  )
}
