import type { AuthUser } from '@/types/auth'

const TOKEN_KEY = 'inventory.access_token'
const USER_KEY = 'inventory.user'

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser: (): AuthUser | null => {
    const storedUser = localStorage.getItem(USER_KEY)
    if (!storedUser) return null
    try {
      return JSON.parse(storedUser) as AuthUser
    } catch {
      localStorage.removeItem(USER_KEY)
      return null
    }
  },
  save: (token: string, user: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
