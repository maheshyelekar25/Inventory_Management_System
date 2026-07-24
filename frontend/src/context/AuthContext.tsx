import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { login as requestLogin, register as requestRegister, type LoginPayload, type RegisterPayload } from '@/api/auth'
import { authStorage } from '@/lib/storage'
import type { AuthUser } from '@/types/auth'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => authStorage.getToken() ? authStorage.getUser() : null)

  const login = useCallback(async (payload: LoginPayload) => {
    const session = await requestLogin(payload)
    authStorage.save(session.access_token, session.user)
    setUser(session.user)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const session = await requestRegister(payload)
    authStorage.save(session.access_token, session.user)
    setUser(session.user)
  }, [])

  const logout = useCallback(() => {
    authStorage.clear()
    setUser(null)
  }, [])

  useEffect(() => {
    window.addEventListener('auth:expired', logout)
    return () => window.removeEventListener('auth:expired', logout)
  }, [logout])

  const value = useMemo(() => ({ user, isAuthenticated: user !== null, login, register, logout }), [user, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
