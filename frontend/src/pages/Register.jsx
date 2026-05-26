import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '../services/api'

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const register = useMutation({
    mutationFn: async (data) => (await api.post('/auth/register', data)).data,
    onSuccess: () => navigate('/login'),
    onError: (err) => setError(err.detail || 'Error al registrar. Verifica los campos.')
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    register.mutate(form)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <form onSubmit={handleSubmit} className="card-body">
          <h2 className="card-title text-2xl mb-2">📝 Crear Cuenta</h2>
          {error && <div className="alert alert-error text-sm py-2">{error}</div>}
          
          <label className="form-control w-full mt-2">
            <span className="label-text">Nombre completo</span>
            <input type="text" className="input input-bordered w-full mt-1"
              value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required />
          </label>
          <label className="form-control w-full">
            <span className="label-text">Email</span>
            <input type="email" className="input input-bordered w-full mt-1"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </label>
          <label className="form-control w-full">
            <span className="label-text">Contraseña</span>
            <input type="password" className="input input-bordered w-full mt-1"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} 
              placeholder="8+ chars, 1 mayúscula, 1 número, 1 símbolo" required />
          </label>
          <button type="submit" className="btn btn-primary w-full mt-4" disabled={register.isPending}>
            {register.isPending ? <span className="loading loading-spinner"></span> : 'Registrarse'}
          </button>
          <p className="text-center text-sm mt-2">
            ¿Ya tienes cuenta? <Link to="/login" className="link link-primary">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </div>
  )
}