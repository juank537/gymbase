import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '../services/api'
import { validateRegistrationForm, extractApiError } from '../utils/errorHandler'
import { Key, CheckCircle } from 'lucide-react'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [touched, setTouched] = useState({})
  const [step, setStep] = useState(1)
  const navigate = useNavigate()

  const register = useMutation({
    mutationFn: async (data) => (await api.post('/auth/register', data)).data,
    onSuccess: () => navigate('/login'),
    onError: (err) => setApiError(extractApiError(err)),
  })

  const getFieldError = (field) => {
    if (!touched[field]) return null
    return errors[field] || null
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const validation = validateRegistrationForm(form)
    setErrors(validation)
  }

  const handleNextStep = () => {
    setApiError('')
    const validation = validateRegistrationForm(form)
    setErrors(validation)
    setTouched({ full_name: true, email: true, password: true })
    if (Object.keys(validation).length > 0) return
    setStep(2)
  }

  const handleCompleteRegistration = () => {
    register.mutate(form)
  }

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: 'Vacío', color: 'bg-surface-variant', message: 'Escribe una contraseña segura.' }
    let score = 0
    if (pass.length >= 6) score += 1
    if (pass.length >= 10) score += 1
    if (/[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1

    if (score <= 2) {
      return { score, text: 'Débil', color: 'bg-red-500', message: 'Añade números, mayúsculas y caracteres especiales.' }
    } else if (score <= 4) {
      return { score, text: 'Media', color: 'bg-[#ece856]', message: 'Contraseña aceptable. Agrega longitud para robustez.' }
    } else {
      return { score, text: 'Fuerte', color: 'bg-primary', message: 'Excelente. Tu cuenta está altamente segura.' }
    }
  }

  const strength = getPasswordStrength(form.password)

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10 py-10 animate-fade-in space-y-8">
        {/* Step Tracker */}
        <div className="flex justify-between items-center px-4">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step === s
                    ? 'bg-primary text-black font-black scale-110 shadow-lg shadow-primary/25'
                    : step > s
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/10'
                }`}
              >
                {step > s ? '✓' : s}
              </span>
              <span
                className={`text-[10px] font-black uppercase tracking-wider hidden sm:block ${
                  step === s ? 'text-primary text-glow' : 'text-on-surface-variant'
                }`}
              >
                {s === 1 ? 'Registro' : 'Completado'}
              </span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-surface-container rounded-3xl p-6 md:p-10 border border-outline-variant/15 space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <Badge variant="primary" label="REGISTRO FUNDAMENTAL" className="mb-4" />
                <h2 className="font-headline font-black text-3xl uppercase tracking-tight text-on-surface">
                  Únete a <span className="text-primary italic">GymBase</span>
                </h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Comienza hoy tu planificación impulsada por datos de rendimiento.
                </p>
              </div>

              {apiError && (
                <div className="bg-red-950/30 border border-red-800/30 rounded-xl p-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-400 text-lg">error</span>
                  <span className="text-red-400 text-xs font-medium">{apiError}</span>
                </div>
              )}

              <div className="space-y-4">
                <Input
                  label="Nombre completo"
                  type="text"
                  placeholder="e.g. Liam Rivers"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  onBlur={() => handleBlur('full_name')}
                  error={getFieldError('full_name') || ''}
                />

                <Input
                  label="Correo Electrónico"
                  type="email"
                  placeholder="tu@dominio.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onBlur={() => handleBlur('email')}
                  error={getFieldError('email') || ''}
                />

                {/* Password strength */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Contraseña
                    </label>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
                      Fuerza: <strong className="text-primary">{strength.text}</strong>
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Contraseña integrada segura..."
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      onBlur={() => handleBlur('password')}
                      className={`w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 outline-none text-on-surface placeholder-on-surface-variant/40 transition-all ${getFieldError('password') ? 'ring-1 ring-red-500/50 border-red-500/50' : ''}`}
                    />
                    <Key className="w-4 h-4 text-on-surface-variant absolute right-4 top-1/2 -translate-y-1/2" />
                  </div>

                  {form.password && (
                    <div className="space-y-1.5 pt-1">
                      <div className="h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`flex-1 mr-0.5 last:mr-0 transition-colors ${
                              i < strength.score ? strength.color : 'bg-surface-variant'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[10.5px] font-medium leading-relaxed text-on-surface-variant">
                        {strength.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={handleNextStep} fullWidth size="lg">
                SIGUIENTE: COMPLETAR REGISTRO
              </Button>

              <p className="text-center text-xs text-on-surface-variant">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-primary font-bold hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center py-4 animate-fade-in flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-inner">
                <CheckCircle className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-2">
                <Badge variant="primary" label="CUENTA LISTA" className="mb-4" />
                <h2 className="font-headline font-black text-4xl uppercase tracking-tighter text-on-surface leading-none">
                  WELCOME TO <br /> <span className="text-primary italic">GYMBASE</span>
                </h2>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed mt-1">
                  Hola <strong className="text-white">{form.full_name}</strong>! Tu perfil está listo para sincronizarse con la plataforma.
                </p>
              </div>

              <div className="w-full bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10 text-left space-y-2 max-w-xs my-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-on-surface-variant">SOCIO</span>
                  <span className="text-white shrink-0">{form.full_name}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-on-surface-variant">EMAIL</span>
                  <span className="text-primary">{form.email}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-on-surface-variant">STATUS</span>
                  <span className="text-primary shrink-0">PENDING ACTIVATION</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                <Button
                  variant="secondary"
                  onClick={() => setStep(1)}
                >
                  REGRESAR
                </Button>
                <Button
                  onClick={handleCompleteRegistration}
                  disabled={register.isPending}
                >
                  {register.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                      Creando...
                    </span>
                  ) : (
                    'CONFIRMAR'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
