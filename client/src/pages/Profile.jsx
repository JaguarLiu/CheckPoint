import { User, MapPin, Calendar, Settings, ChevronRight, CalendarSearch, CheckCircle2, History } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useAttendanceHistory } from '../hooks/useAttendance.js'
import PaperPiece from '../components/PaperPiece.jsx'

const menuItems = [
  { icon: MapPin, text: '辦公地點設置', color: 'text-emerald-500', rotate: '1deg' },
  { icon: Calendar, text: '請假申請清單', color: 'text-sky-500', rotate: '-1.2deg' },
  { icon: Settings, text: '系統通知設定', color: 'text-slate-400', rotate: '0.8deg' },
]

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const { records } = useAttendanceHistory({ month: currentMonth })

  const attendanceDays = records.filter(r => r.punchIn).length
  const lateOrEarlyCount = records.filter(r =>
    ['late', 'early_leave', 'late_and_early_leave'].includes(r.status)
  ).length

  return (
    <main className="w-full relative z-10 px-4 mt-4 animate-in slide-in-from-right-4 duration-300">
      <PaperPiece color="white" rotate="-1deg" className="p-6 shadow-md mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-sky-100 border-4 border-sky-50 flex items-center justify-center shadow-inner overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-sky-500" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-700">{user?.name || '使用者'}</h2>
            {user?.empNo && <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">工號: {user.empNo}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-dashed border-slate-100 pt-4">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">本月出勤</p>
            <p className="text-xl font-black text-slate-700">{attendanceDays} 天</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">遲到早退</p>
            <p className="text-xl font-black text-orange-500">{lateOrEarlyCount} 次</p>
          </div>
        </div>
      </PaperPiece>

      <div className="space-y-4 px-1 pb-10">
        <button onClick={() => navigate('/history')} className="w-full text-left active:scale-95 transition-transform">
          <PaperPiece color="white" rotate="-0.6deg" className="p-4 flex items-center justify-between shadow-sm border-b-2 border-slate-200/40">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-sky-50 border border-sky-100">
                <History size={20} className="text-sky-500" />
              </div>
              <span className="font-black text-slate-600 tracking-wide">打卡紀錄</span>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </PaperPiece>
        </button>

        {isAdmin && (
          <>
            <button onClick={() => navigate('/admin/attendance')} className="w-full text-left active:scale-95 transition-transform">
              <PaperPiece color="white" rotate="0.8deg" className="p-4 flex items-center justify-between shadow-sm border-b-2 border-slate-200/40">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                    <CalendarSearch size={20} className="text-emerald-500" />
                  </div>
                  <span className="font-black text-slate-600 tracking-wide">月度出勤統計</span>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </PaperPiece>
            </button>

            <button onClick={() => navigate('/admin/corrections')} className="w-full text-left active:scale-95 transition-transform">
              <PaperPiece color="white" rotate="-0.5deg" className="p-4 flex items-center justify-between shadow-sm border-b-2 border-slate-200/40">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-orange-50 border border-orange-100">
                    <CheckCircle2 size={20} className="text-orange-500" />
                  </div>
                  <span className="font-black text-slate-600 tracking-wide">審核補打卡申請</span>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </PaperPiece>
            </button>

            <div className="h-4" />
          </>
        )}

        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button key={item.text} className="w-full text-left active:scale-95 transition-transform opacity-70">
              <PaperPiece
                color="white"
                rotate={item.rotate}
                className="p-4 flex items-center justify-between shadow-sm hover:shadow-md border-b-2 border-slate-200/40"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <Icon size={20} className={item.color} />
                  </div>
                  <span className="font-black text-slate-600 tracking-wide">{item.text}</span>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </PaperPiece>
            </button>
          )
        })}

        <button
          onClick={() => { logout(); navigate('/login') }}
          className="w-full text-center mt-6 text-slate-300 font-black text-xs uppercase tracking-widest hover:text-red-400 transition-colors"
        >
          Logout Account
        </button>
      </div>
    </main>
  )
}
