import { useState } from 'react'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import PaperPiece from '../components/PaperPiece.jsx'
import { fetcher, reviewCorrectionRequest } from '../services/api.js'

function parseReason(reason) {
  const match = reason.match(/^\[(.+?)\]\s*(\d{1,2}:\d{2})\s*-\s*(.*)$/)
  if (match) return { type: match[1], time: match[2], detail: match[3] }
  return { type: '--', time: '--', detail: reason }
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

export default function AdminCorrections() {
  const navigate = useNavigate()
  const { data: requests, mutate } = useSWR('/admin/correction-requests?status=pending', fetcher)
  const [processing, setProcessing] = useState(null)

  async function handleReview(id, status) {
    setProcessing(id)
    try {
      await reviewCorrectionRequest(id, status)
      mutate()
    } catch (err) {
      alert(err?.message || '操作失敗')
    } finally {
      setProcessing(null)
    }
  }

  const pendingRequests = requests ?? []

  return (
    <main className="w-full relative z-10 px-4 mt-4 animate-in fade-in duration-300">
      <button onClick={() => navigate('/profile')} className="flex items-center gap-2 mb-6 text-slate-400 hover:text-slate-600 transition-colors font-black text-xs uppercase tracking-widest">
        <ArrowLeft size={16} /> 返回個人中心
      </button>

      <div className="flex items-center gap-2 mb-6 px-2">
        <CheckCircle2 size={24} className="text-orange-500" />
        <h3 className="font-black text-2xl text-slate-700 tracking-tight">補打卡審核</h3>
      </div>

      <div className="space-y-6 pb-10">
        {pendingRequests.map((req, idx) => {
          const parsed = parseReason(req.reason)
          const userName = req.attendance?.user?.name || req.attendance?.user?.email || '--'
          const workDate = req.attendance?.workDate ? formatDate(req.attendance.workDate) : '--'
          const isProcessing = processing === req.id

          return (
            <PaperPiece key={req.id} color="white" rotate={idx % 2 === 0 ? '1deg' : '-1deg'} className="p-6 shadow-md border-l-8 border-orange-400">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-black text-lg text-slate-700">{userName}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {workDate} · {parsed.time} ({parsed.type})
                  </p>
                </div>
                <div className="bg-orange-50 text-orange-500 text-[9px] font-black px-2 py-0.5 border border-orange-200 uppercase">
                  Pending
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-none border-l-2 border-slate-200 mb-6">
                <p className="text-xs font-bold text-slate-500 italic">&quot; {parsed.detail} &quot;</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleReview(req.id, 'approved')}
                  disabled={isProcessing}
                  className="flex-1 bg-emerald-500 text-white py-2.5 font-black text-xs uppercase tracking-widest border-b-4 border-emerald-700 active:border-b-0 active:translate-y-[2px] transition-all disabled:opacity-60"
                >
                  核准通過
                </button>
                <button
                  onClick={() => handleReview(req.id, 'rejected')}
                  disabled={isProcessing}
                  className="flex-1 bg-red-500 text-white py-2.5 font-black text-xs uppercase tracking-widest border-b-4 border-red-700 active:border-b-0 active:translate-y-[2px] transition-all disabled:opacity-60"
                >
                  駁回申請
                </button>
              </div>
            </PaperPiece>
          )
        })}

        {pendingRequests.length === 0 && (
          <div className="text-center py-20 opacity-30 flex flex-col items-center">
            <CheckCircle2 size={48} className="mb-2" />
            <p className="font-black text-xs uppercase tracking-widest">目前沒有待審核事項</p>
          </div>
        )}
      </div>
    </main>
  )
}
