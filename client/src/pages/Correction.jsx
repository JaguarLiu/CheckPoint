import { useState } from 'react'
import { ClipboardPen, Send, AlertCircle, Search, ChevronDown } from 'lucide-react'
import useSWR from 'swr'
import PaperPiece from '../components/PaperPiece.jsx'
import { submitCorrectionRequest, fetcher } from '../services/api.js'

const statusMap = {
  pending: { label: '審核中', color: 'text-amber-500 border-amber-500' },
  approved: { label: '已通過', color: 'text-emerald-500 border-emerald-500' },
  rejected: { label: '已駁回', color: 'text-red-500 border-red-500' },
}

function parseReason(reason) {
  const match = reason.match(/^\[(.+?)\]\s*(\d{1,2}:\d{2})\s*-\s*(.*)$/)
  if (match) return { type: match[1], time: match[2], detail: match[3] }
  return { type: '--', time: '--', detail: reason }
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

function buildMonthOptions() {
  const now = new Date()
  const options = []
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`
    options.push({ value, label })
  }
  return options
}

export default function Correction() {
  const [subTab, setSubTab] = useState('apply')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [type, setType] = useState('in')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const monthOptions = buildMonthOptions()
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value)

  const { data: corrections, mutate } = useSWR('/correction-requests', fetcher)

  const filteredRecords = (corrections ?? []).filter((r) => {
    const workDate = r.attendance?.workDate
    if (!workDate) return false
    return workDate.startsWith(selectedMonth)
  })

  async function handleSubmit() {
    if (!date || !time || !reason.trim()) {
      alert('請填寫完整資料')
      return
    }

    setIsSubmitting(true)
    try {
      await submitCorrectionRequest({ workDate: date, time, type, reason: reason.trim() })
      alert('申請已送出')
      setDate('')
      setTime('')
      setReason('')
      mutate()
    } catch (err) {
      const msg = err?.info?.error || err?.message || '提交失敗，請稍後再試'
      alert(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="w-full relative z-10 px-4 mt-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          <ClipboardPen size={24} className="text-orange-500" />
          <h3 className="font-black text-2xl text-slate-700 tracking-tight">補打卡服務</h3>
        </div>
      </div>

      {/* 子頁籤切換 */}
      <div className="flex mb-8 bg-slate-200/40 p-1 rounded-none border border-slate-200">
        <button
          onClick={() => setSubTab('apply')}
          className={`flex-1 py-2.5 font-black text-xs uppercase tracking-widest transition-all ${subTab === 'apply' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-400'}`}
        >
          提交申請
        </button>
        <button
          onClick={() => setSubTab('list')}
          className={`flex-1 py-2.5 font-black text-xs uppercase tracking-widest transition-all ${subTab === 'list' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-400'}`}
        >
          申請紀錄
        </button>
      </div>

      {subTab === 'apply' ? (
        <div className="animate-in fade-in duration-300">
          <PaperPiece color="white" rotate="-0.5deg" className="p-8 shadow-lg mb-10">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">日期</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border-b-2 border-slate-200 p-2 font-black text-slate-700 rounded-none focus:outline-none focus:border-orange-400 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">時間</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="09:00"
                    maxLength={5}
                    value={time}
                    onChange={(e) => {
                      let v = e.target.value.replace(/[^\d:]/g, '')
                      if (v.length === 2 && !v.includes(':') && time.length < v.length) v += ':'
                      setTime(v)
                    }}
                    className="w-full bg-slate-50 border-b-2 border-slate-200 p-2 font-black text-slate-700 rounded-none focus:outline-none focus:border-orange-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">類型</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-50 border-b-2 border-slate-200 p-2 font-black text-slate-700 rounded-none focus:outline-none focus:border-orange-400 transition-colors appearance-none"
                  >
                    <option value="in">上班</option>
                    <option value="out">下班</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">申請原因</label>
                <textarea
                  rows="3"
                  placeholder="請描述補打卡原因..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border-b-2 border-slate-200 p-3 font-black text-slate-600 rounded-none focus:outline-none focus:border-orange-400 transition-colors resize-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600 border-b-4 border-orange-700 active:border-b-0 active:translate-y-[2px] p-4 rounded-none flex items-center justify-center gap-3 transition-all disabled:opacity-60 disabled:pointer-events-none"
              >
                <Send size={20} className="text-white" />
                <span className="font-black text-white text-lg tracking-widest">
                  {isSubmitting ? '提交中...' : '提交申請'}
                </span>
              </button>
            </div>

            {/* 裝飾虛線 */}
            <div className="absolute top-0 right-12 w-[1px] h-full border-r border-dashed border-slate-100 -z-10" />
          </PaperPiece>

          <div className="bg-sky-50 p-4 rounded-none border-l-4 border-sky-400 flex gap-3 mb-10 shadow-sm">
            <AlertCircle size={18} className="text-sky-400 shrink-0" />
            <p className="text-[11px] font-bold text-sky-600 leading-relaxed">
              溫馨提示：補打卡申請送出後，需經由部門主管審核方能生效。
            </p>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300 pb-10">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 bg-sky-400" />
              <h4 className="font-black text-xs text-slate-500 uppercase tracking-widest">Request History</h4>
            </div>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-white px-4 py-1.5 pr-8 rounded-none border border-slate-100 shadow-sm text-[10px] font-black text-slate-400 uppercase tracking-tighter focus:outline-none"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <PaperPiece color="white" rotate="0.5deg" className="p-4 shadow-lg min-h-[400px]">
            <div className="grid grid-cols-4 gap-2 mb-4 pb-2 border-b-2 border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
              <div>日期</div>
              <div>時間</div>
              <div>類型</div>
              <div className="text-right">狀態</div>
            </div>

            <div className="flex flex-col">
              {filteredRecords.map((record, index) => {
                const parsed = parseReason(record.reason)
                const st = statusMap[record.status] || statusMap.pending
                return (
                  <div
                    key={record.id}
                    className={`grid grid-cols-4 gap-2 py-4 px-2 items-center ${index !== filteredRecords.length - 1 ? 'border-b border-slate-50' : ''}`}
                  >
                    <div className="text-[10px] font-black text-slate-500 font-mono leading-tight">
                      {formatDate(record.attendance.workDate)}
                    </div>
                    <div className="text-sm font-black text-slate-700 font-mono">
                      {parsed.time}
                    </div>
                    <div className="text-xs font-black text-slate-400">
                      {parsed.type}
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-none border border-current ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredRecords.length === 0 && (
              <div className="text-center py-20 opacity-20 flex flex-col items-center">
                <Search size={48} className="mb-2" />
                <p className="font-black text-xs uppercase tracking-widest">No records found</p>
              </div>
            )}
          </PaperPiece>
        </div>
      )}
    </main>
  )
}
