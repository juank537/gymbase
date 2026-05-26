import { useMutation } from '@tanstack/react-query'
import api from './api'
import { useAuthStore } from '../store/authStore'

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: async (credentials) => {
      await api.post('/auth/login', credentials)
      const { data: user } = await api.get('/users/me')
      return user
    },
    onSuccess: (user) => setAuth(user),
  })
}

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data) => (await api.post('/auth/register', data)).data,
  })
}
