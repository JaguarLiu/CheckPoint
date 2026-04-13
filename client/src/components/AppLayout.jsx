import { useLocation, Outlet } from 'react-router-dom'
import { User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import PaperPiece from './PaperPiece.jsx'
import BottomNav from './BottomNav.jsx'

export default function AppLayout() {
  const location = useLocation()
  const { user } = useAuth()

  const headerTitles = {
    '/': `${user?.name || '使用者'}，你好！`,
    '/history': '歷史紀錄',
    '/correction': '補打卡申請',
    '/profile': '個人中心',
    '/admin/attendance': '出勤查詢',
    '/admin/corrections': '補卡審核',
  }
  const title = headerTitles[location.pathname] || 'FlashPoint'

  return (
    <div className="min-h-screen bg-[#f3f0e6] flex justify-center items-start font-sans overflow-hidden text-slate-900">
      <div className="w-full max-w-md h-screen relative flex flex-col">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute top-[-5%] left-[-10%] w-[60%] h-40 bg-emerald-100 -rotate-3 rounded-[30%]" />
          <div className="absolute top-[5%] right-[-5%] w-[50%] h-60 bg-sky-100 rotate-6 rounded-[20%]" />
          <div className="absolute bottom-[20%] left-[-15%] w-[70%] h-60 bg-orange-50 -rotate-6 rounded-[40%]" />
        </div>

        {/* 頂部標籤 - 浮動透明，不佔空間 */}
        <header className="absolute top-0 left-0 w-full py-6 flex justify-center z-20 pointer-events-none">
          <div className="pointer-events-auto">
            <PaperPiece color="white" rotate="-1.5deg" className="px-6 py-2 shadow-md inline-flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <User size={16} className="text-sky-500" />
                )}
              </div>
              <span className="font-black text-slate-700">{title}</span>
            </PaperPiece>
          </div>
        </header>

        {/* 內容區 */}
        <div className="flex-1 overflow-y-auto pb-24 pt-20 custom-scrollbar relative z-10 px-2">
          <Outlet />
        </div>

        <BottomNav />
      </div>
    </div>
  )
}
