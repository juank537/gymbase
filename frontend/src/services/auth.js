import { useMutation } from '@tanstack/react-query'
import api from './api'
import { useAuthStore } from '../store/authStore'

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: async (credentials) => {
      const { data } = await api.post('/auth/login', credentials)
      return data
    },
    onSuccess: async ({ access_token }) => {
      // Carga perfil completo tras login exitoso
      try {
        const { data: user } = await api.get('/users/me')
        setAuth(user, access_token)
      } catch (err) {
        console.error('Fallo al cargar perfil tras login:', err)
      }
    }
  })
}

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data) => {
      return (await api.post('/auth/register', data)).data
    }
  })
}