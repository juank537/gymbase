import { useEffect, useRef } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Zap } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const hasChecked = useRef(false)
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticated && isLoading && !hasChecked.current) {
      hasChecked.current = true
      checkAuth()
    }
  }, [isAuthenticated, isLoading, checkAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(243,255,202,0.3)] animate-pulse">
            <Zap className="w-6 h-6 text-black fill-current" />
          </div>
          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
