import { useState } from 'react'
import { ArrowLeft, CalendarSearch } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PaperPiece from '../components/PaperPiece.jsx'
import { getAdminAttendanceList } from '../services/api.js'

function formatHours(minutes) {
  if (!minutes) return '0.0'
  return (minutes / 60).toFixed(1)
}

export default function AdminAttendance() {
  const navigate = useNavigate()
  const [month, setMonth] = useState('')
  const [records, setRecords] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleQuery() {
    if (!month) return
    setIsLoading(true)
    try {
      const data = await getAdminAttendanceList(month)
      setRecords(data)
    } catch (err) {
      alert(err?.message || '查詢失敗')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="w-full relative z-10 px-4 mt-4 animate-in fade-in duration-300">
      <button onClick={() => navigate('/profile')} className="flex items-center gap-2 mb-6 text-slate-400 hover:text-slate-600 transition-colors font-black text-xs uppercase tracking-widest">
        <ArrowLeft size={16} /> 返回個人中心
      </button>

      <div className="flex items-center gap-2 mb-6 px-2">
        <CalendarSearch size={24} className="text-emerald-500" />
        <h3 className="font-black text-2xl text-slate-700 tracking-tight">月度出勤統計</h3>
      </div>

      <PaperPiece color="white" rotate="-0.5deg" className="p-8 shadow-lg mb-8">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">選擇查詢月份</label>
        <div className="flex gap-2">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="flex-1 bg-slate-50 border-b-2 border-slate-200 p-2 font-black text-slate-700 rounded-none focus:outline-none focus:border-emerald-400 transition-colors"
          />
          <button
            onClick={handleQuery}
            disabled={isLoading || !month}
            className="bg-emerald-500 text-white px-6 font-black text-xs uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-60"
          >
            {isLoading ? '查詢中...' : '查詢'}
          </button>
        </div>
      </PaperPiece>

      {records === null ? (
        <div className="mt-8 opacity-60 italic text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          --- 請選擇月份以顯示結果 ---
        </div>
      ) : records.length === 0 ? (
        <div className="mt-8 opacity-60 italic text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          --- 該月份無出勤紀錄 ---
        </div>
      ) : (
        <PaperPiece color="white" rotate="0.5deg" className="p-4 shadow-lg mb-10">
          <div className="grid grid-cols-5 gap-2 mb-4 pb-2 border-b-2 border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
            <div>姓名</div>
            <div className="text-center">出勤天數</div>
            <div className="text-center">總工時(hr)</div>
            <div className="text-center">遲到天數</div>
            <div className="text-center">早退天數</div>
          </div>
          <div className="flex flex-col">
            {records.map((record, index) => (
              <div
                key={record.user?.id || index}
                className={`grid grid-cols-5 gap-2 py-4 px-2 items-center ${index !== records.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <div className="text-[11px] font-black text-slate-700 leading-tight">
                  {record.user?.name || record.user?.email || '--'}
                </div>
                <div className="text-sm font-black text-slate-700 font-mono text-center">
                  {record.attendanceDays}
                </div>
                <div className="text-sm font-black text-slate-700 font-mono text-center">
                  {formatHours(record.totalWorkDuration)}
                </div>
                <div className="text-sm font-black font-mono text-center">
                  <span className={record.lateDays > 0 ? 'text-red-500' : 'text-slate-700'}>
                    {record.lateDays}
                  </span>
                </div>
                <div className="text-sm font-black font-mono text-center">
                  <span className={record.earlyLeaveDays > 0 ? 'text-red-500' : 'text-slate-700'}>
                    {record.earlyLeaveDays}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </PaperPiece>
      )}
    </main>
  )
}
