import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated && isLoading) checkAuth()
  }, [])

  if (isLoading) {
    return <span className="loading loading-spinner loading-lg mx-auto block mt-10"></span>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
