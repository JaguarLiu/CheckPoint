import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import PaperPiece from '../components/PaperPiece.jsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function CompanyLogo({ className }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img
        src="/logo.png"
        alt="公司標誌"
        className="max-w-full h-auto object-contain"
        style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))' }}
      />
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError('尚未設定 VITE_GOOGLE_CLIENT_ID')
      return
    }

    setError(null)
    setIsLoading(true)

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'email profile',
      callback: async (response) => {
        if (response.error) {
          setError('Google 登入失敗')
          setIsLoading(false)
          return
        }

        try {
          // 用 access_token 取得用戶資料後送 id_token 給後端
          // Google Identity Services 的 initCodeClient/initTokenClient 回傳 access_token
          // 改用 initCodeClient 取得 credential 或直接用 One Tap
          await login(response.access_token)
          navigate('/')
        } catch {
          setError('登入失敗，請稍後再試')
          setIsLoading(false)
        }
      },
    })

    client.requestAccessToken()
  }, [login, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f3f0e6] relative">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-[10%] left-[-20%] w-[80%] h-80 bg-emerald-100 rotate-12 rounded-[40%]" />
        <div className="absolute bottom-[10%] right-[-20%] w-[80%] h-80 bg-sky-100 -rotate-12 rounded-[40%]" />
      </div>

      <PaperPiece color="white" rotate="-2deg" className="w-full max-w-sm p-10 flex flex-col items-center shadow-xl z-10">
        {/* Logo 區域 */}
        <div className="relative mb-10 w-full flex justify-center">
          <CompanyLogo className="w-48 rotate-1" />
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-1.5 w-24 bg-orange-400/20 rounded-full" />
        </div>

        {/* 標題與副標題 */}
        <h1 className="text-2xl font-black text-slate-700 mb-2">FlashPoint</h1>
        <p className="text-xs font-bold text-slate-400 mb-10 uppercase tracking-[0.2em]">打卡系統</p>

        {/* 錯誤提示 */}
        {error && (
          <div className="w-full mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-500 text-center">
            {error}
          </div>
        )}

        {/* Google Auth 登入按鈕 */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full relative group active:scale-95 transition-transform mt-4 disabled:opacity-60 disabled:pointer-events-none"
        >
          {/* 按鈕陰影層 */}
          <div className="absolute inset-0 bg-slate-800 rounded-xl translate-y-1 translate-x-1" />
          {/* 按鈕主體 */}
          <div className="relative bg-white border-2 border-slate-800 p-4 rounded-xl flex items-center justify-center gap-3 shadow-sm group-hover:-translate-y-0.5 group-hover:-translate-x-0.5 transition-transform">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81.38z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="font-black text-slate-700">
              {isLoading ? '登入中...' : 'Google 帳號登入'}
            </span>
          </div>
        </button>

        {/* 底部裝飾字樣 */}
        <p className="mt-10 text-[10px] font-bold text-slate-300 uppercase tracking-widest italic text-center">
          Powered by Flashtele.com
        </p>
      </PaperPiece>
    </div>
  )
}
