import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: sessionStorage.getItem('access_token') || null,
  isAuthenticated: !!sessionStorage.getItem('access_token'),
  setAuth: (user, token) => {
    sessionStorage.setItem('access_token', token)
    set({ user, token, isAuthenticated: true })
  },
  setUser: (user) => set({ user }),
  logout: () => {
    sessionStorage.removeItem('access_token')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
