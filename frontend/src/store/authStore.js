import { create } from 'zustand'
import api from '../services/api'

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  setUser: (user) => set({ user }),
  logout: async () => {
    try { await api.post('/auth/logout') } catch { /* ignore */ }
    set({ user: null, isAuthenticated: false, isLoading: false })
  },
  checkAuth: async () => {
    try {
      const { data } = await api.get('/users/me')
      set({ user: data, isAuthenticated: true, isLoading: false })
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = '/login'
      }
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
