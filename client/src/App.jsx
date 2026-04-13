import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import AppLayout from './components/AppLayout.jsx'

const Login = lazy(() => import('./pages/Login.jsx'))
const Attendance = lazy(() => import('./pages/Attendance.jsx'))
const History = lazy(() => import('./pages/History.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const Correction = lazy(() => import('./pages/Correction.jsx'))
const Admin = lazy(() => import('./pages/Admin.jsx'))
const AdminAttendance = lazy(() => import('./pages/AdminAttendance.jsx'))
const AdminCorrections = lazy(() => import('./pages/AdminCorrections.jsx'))
const LeaveRequest = lazy(() => import('./pages/LeaveRequest.jsx'))

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f0e6]">
      <div className="text-slate-400 text-sm font-medium">載入中...</div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Attendance />} />
          <Route path="history" element={<History />} />
          <Route path="correction" element={<Correction />} />
          <Route path="leave" element={<LeaveRequest />} />
          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<Admin />} />
          <Route path="admin/attendance" element={<AdminAttendance />} />
          <Route path="admin/corrections" element={<AdminCorrections />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
