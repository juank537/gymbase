import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'
import { validateLoginForm, extractApiError } from '../utils/errorHandler'
import { Zap, Key, LogIn } from 'lucide-react'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [touched, setTouched] = useState({})
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const login = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/auth/login', data)
      return res.data.user
    },
    onSuccess: (user) => {
      setAuth(user)
      navigate('/')
    },
    onError: (err) => setApiError(extractApiError(err)),
  })

  const getFieldError = (field) => {
    if (!touched[field]) return null
    return errors[field] || null
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const validation = validateLoginForm(form)
    setErrors(validation)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setApiError('')
    const validation = validateLoginForm(form)
    setErrors(validation)
    setTouched({ email: true, password: true })
    if (Object.keys(validation).length > 0) return
    login.mutate(form)
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(243,255,202,0.3)] mx-auto mb-4">
            <Zap className="w-7 h-7 text-black fill-current" />
          </div>
          <h1 className="font-headline font-black text-3xl uppercase tracking-tighter text-on-surface">
            Inicia <span className="text-primary italic">Sesión</span>
          </h1>
          <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
            Accede a tu plataforma de rendimiento de alto impacto.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-surface-container rounded-3xl p-6 md:p-8 border border-outline-variant/15 space-y-6">
          {apiError && (
            <div className="bg-red-950/30 border border-red-800/30 rounded-xl p-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400 text-lg">error</span>
              <span className="text-red-400 text-xs font-medium">{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="tu@dominio.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onBlur={() => handleBlur('email')}
              error={getFieldError('email') || ''}
            />

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Contraseña segura..."
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onBlur={() => handleBlur('password')}
                  className={`w-full bg-surface-container-low border border-outline-variant/15 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none text-on-surface placeholder-on-surface-variant/40 transition-all ${getFieldError('password') ? 'ring-1 ring-red-500/50 border-red-500/50' : ''}`}
                />
                <Key className="w-4 h-4 text-on-surface-variant absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
              {getFieldError('password') && (
                <p className="text-[10px] font-medium text-red-400">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={login.isPending}
              icon={login.isPending ? undefined : <LogIn className="w-4 h-4" />}
            >
              {login.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : (
                'ACCEDER A LA PLATAFORMA'
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-on-surface-variant">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
