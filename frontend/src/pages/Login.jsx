import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
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
    onError: (err) => setError(err.detail || 'Credenciales inválidas'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    login.mutate(form)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <form onSubmit={handleSubmit} className="card-body">
          <h2 className="card-title text-2xl mb-2">Iniciar Sesión</h2>
          {error && <div className="alert alert-error text-sm py-2">{error}</div>}
          <label className="form-control w-full mt-2">
            <span className="label-text">Email</span>
            <input type="email" className="input input-bordered w-full mt-1"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </label>
          <label className="form-control w-full">
            <span className="label-text">Contraseña</span>
            <input type="password" className="input input-bordered w-full mt-1"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </label>
          <button type="submit" className="btn btn-primary w-full mt-4" disabled={login.isPending}>
            {login.isPending ? <span className="loading loading-spinner"></span> : 'Entrar'}
          </button>
          <p className="text-center text-sm mt-2">
            ¿No tienes cuenta? <Link to="/register" className="link link-primary">Regístrate</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
