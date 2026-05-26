import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user, logout } = useAuthStore()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Control</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-70">{user?.email}</span>
          <div className="badge badge-outline">{user?.role}</div>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Cerrar sesión</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="stat bg-base-100 shadow-sm rounded-box p-4">
          <div className="stat-title">Bienvenido</div>
          <div className="stat-value text-lg">{user?.full_name}</div>
          <div className="stat-desc">Rol: {user?.role}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/members" className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow">
          <div className="card-body">
            <h2 className="card-title">Gestión de Socios</h2>
            <p>Administra los miembros del gimnasio: altas, bajas y consultas.</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
