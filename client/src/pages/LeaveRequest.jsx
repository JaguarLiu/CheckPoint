import { useState } from 'react'
import { CalendarPlus, Send, AlertCircle } from 'lucide-react'
import PaperPiece from '../components/PaperPiece.jsx'
import { submitLeaveRequest } from '../services/api.js'

const leaveTypes = [
  { value: 'annual_leave', label: '特休假 (Annual Leave)' },
  { value: 'sick_leave', label: '病假 (Sick Leave)' },
  { value: 'personal_leave', label: '事假 (Personal Leave)' },
  { value: 'compensatory_leave', label: '補休 (Compensatory Time)' },
]

export default function LeaveRequest() {
  const [leaveType, setLeaveType] = useState('annual_leave')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    if (!startDate || !startTime || !endDate || !endTime) {
      alert('請填寫開始與結束的日期及時間')
      return
    }
    setIsSubmitting(true)
    try {
      await submitLeaveRequest({ leaveType, startDate, startTime, endDate, endTime, reason })
      alert('請假申請已送出，等待主管審核')
      setStartDate('')
      setStartTime('')
      setEndDate('')
      setEndTime('')
      setReason('')
    } catch (err) {
      alert(err?.message || '送出失敗，請稍後再試')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="w-full relative z-10 px-4 mt-4 animate-in slide-in-from-bottom-4 duration-300 pb-20">
      <div className="flex items-center gap-2 mb-6 px-2">
        <CalendarPlus size={24} className="text-sky-500" />
        <h3 className="font-black text-2xl text-slate-700 tracking-tight">請假申請表</h3>
      </div>

      <PaperPiece color="white" rotate="1deg" className="p-8 shadow-lg mb-8">
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">假別選擇</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full bg-slate-50 border-b-2 border-slate-200 p-2 font-black text-slate-700 rounded-none focus:outline-none focus:border-sky-400 transition-colors appearance-none"
            >
              {leaveTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">開始時間</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-[2] bg-slate-50 border-b-2 border-slate-200 p-2 font-black text-slate-700 rounded-none focus:outline-none focus:border-sky-400 transition-colors"
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="flex-1 bg-slate-50 border-b-2 border-slate-200 p-2 font-black text-slate-700 rounded-none focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">結束時間</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-[2] bg-slate-50 border-b-2 border-slate-200 p-2 font-black text-slate-700 rounded-none focus:outline-none focus:border-sky-400 transition-colors"
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="flex-1 bg-slate-50 border-b-2 border-slate-200 p-2 font-black text-slate-700 rounded-none focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">請假事由</label>
            <textarea
              rows="3"
              placeholder="請描述請假原因 (選填)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border-b-2 border-slate-200 p-3 font-black text-slate-600 rounded-none focus:outline-none focus:border-sky-400 transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-sky-500 hover:bg-sky-600 border-b-4 border-sky-700 active:border-b-0 active:translate-y-[2px] p-4 rounded-none flex items-center justify-center gap-3 transition-all disabled:opacity-60"
          >
            <Send size={20} className="text-white" />
            <span className="font-black text-white text-lg tracking-widest uppercase">
              {isSubmitting ? 'Sending...' : 'Send Leave Request'}
            </span>
          </button>
        </div>
      </PaperPiece>

      <div className="bg-amber-50 p-4 rounded-none border-l-4 border-amber-400 flex gap-3 mb-10">
        <AlertCircle size={18} className="text-amber-500 shrink-0" />
        <p className="text-[11px] font-bold text-amber-600 leading-relaxed italic">
          &quot; 請提前與部門夥伴溝通職務代理事宜，祝您請假順利！ &quot;
        </p>
      </div>
    </main>
  )
}
