import { LogIn, LogOut, AlertCircle } from 'lucide-react'

export default function AttendanceCard({ type, time, note, borderColor, rotate = "0deg", isAlert = false }) {
  return (
    <div className="relative inline-block w-full px-4 mb-4" style={{ transform: `rotate(${rotate})` }}>
      {/* 頂部模擬膠帶裝飾 */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-5 z-20 border bg-white/40 border-white/20 backdrop-blur-[1px]"
        style={{ transform: 'rotate(-3deg)', boxShadow: '1px 1px 2px rgba(0,0,0,0.02)' }}
      />

      <div
        className="relative p-4 bg-white shadow-md transition-transform active:scale-95"
        style={{
          borderLeft: `8px solid ${isAlert ? '#ef4444' : borderColor}`,
          borderRadius: '2px 25px 5px 20px/15px 5px 30px 2px',
          boxShadow: '3px 3px 10px rgba(0,0,0,0.04)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center min-w-[50px]">
            {type === 'in' ? (
              <LogIn size={22} className={isAlert ? 'text-red-500' : 'text-emerald-500'} />
            ) : (
              <LogOut size={22} className={isAlert ? 'text-red-500' : 'text-orange-500'} />
            )}
            <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 ${isAlert ? 'text-red-400' : 'text-slate-300'}`}>
              {type === 'in' ? (isAlert ? 'LATE' : 'STARTED') : (isAlert ? 'EARLY' : 'FINISHED')}
            </span>
          </div>

          <div className={`flex-1 border-l border-dashed pl-4 ${isAlert ? 'border-red-100' : 'border-slate-100'}`}>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-black font-mono tracking-tight ${isAlert ? 'text-red-600' : 'text-slate-700'}`}>{time}</span>
              <span className={`text-[10px] font-bold ${isAlert ? 'text-red-400' : 'text-slate-400'}`}>
                {type === 'in' ? '上班' : '下班'}
                {isAlert && (type === 'in' ? ' (遲到)' : ' (早退)')}
              </span>
            </div>
            <p className={`text-[11px] font-medium line-clamp-1 italic ${isAlert ? 'text-red-400' : 'text-slate-400'}`}>
              &quot;{note}&quot;
            </p>
          </div>

          {isAlert && <AlertCircle size={16} className="text-red-400 opacity-50" />}
        </div>
      </div>
    </div>
  )
}
