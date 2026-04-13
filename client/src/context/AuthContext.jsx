import { createContext, useState, useEffect, useCallback } from 'react'
import { getCurrentUser, loginWithGoogle, logout as authLogout } from '../services/auth.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser().then(setUser).finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (credential) => {
    const userData = await loginWithGoogle(credential)
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    authLogout()
    setUser(null)
  }, [])

  const value = { user, loading, login, logout }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
