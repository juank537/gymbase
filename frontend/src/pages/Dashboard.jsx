import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data } = await api.get('/metrics/dashboard')
        setMetrics(data)
      } catch (err) {
        setError(err.response?.data?.detail || 'Error al cargar métricas')
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === 'admin') {
      fetchMetrics()
    }
  }, [user])

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Control</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-70">{user?.email}</span>
          <div className="badge badge-outline">{user?.role}</div>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Cerrar sesión</button>
        </div>
      </div>

      {user?.role === 'admin' && metrics && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <div className="text-sm opacity-70">Miembros Activos</div>
                <div className="text-3xl font-bold text-primary">
                  {metrics.overview.active_members}
                </div>
                <div className="text-xs opacity-50">
                  de {metrics.overview.total_members} total
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <div className="text-sm opacity-70">Nuevos (30 días)</div>
                <div className="text-3xl font-bold text-success">
                  +{metrics.members.new_last_30_days}
                </div>
                <div className="text-xs opacity-50">
                  {metrics.members.new_this_month} este mes
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <div className="text-sm opacity-70">Ingresos Mensuales</div>
                <div className="text-3xl font-bold text-accent">
                  ${metrics.overview.monthly_revenue.toLocaleString()}
                </div>
                <div className="text-xs opacity-50">
                  ${metrics.overview.revenue_this_month} este mes
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <div className="text-sm opacity-70">Membresías Activas</div>
                <div className="text-3xl font-bold text-info">
                  {metrics.memberships.active}
                </div>
                <div className="text-xs opacity-50">
                  {metrics.memberships.total} totales
                </div>
              </div>
            </div>
          </div>

          {/* Members by Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <h3 className="card-title text-lg">Miembros por Estado</h3>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex justify-between">
                    <span className="badge badge-primary badge-sm">Trial</span>
                    <span className="font-bold">{metrics.members.by_status.trial || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="badge badge-success badge-sm">Activos</span>
                    <span className="font-bold">{metrics.members.by_status.active || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="badge badge-error badge-sm">Cancelados</span>
                    <span className="font-bold">{metrics.members.by_status.cancelled || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Memberships by Plan */}
            <div className="card bg-base-100 shadow-md md:col-span-2">
              <div className="card-body p-4">
                <h3 className="card-title text-lg">Membresías por Plan</h3>
                <div className="overflow-x-auto mt-2">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Plan</th>
                        <th className="text-right">Miembros</th>
                        <th className="text-right">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.memberships.by_plan.map((plan, idx) => (
                        <tr key={idx}>
                          <td className="font-medium">{plan.plan_name}</td>
                          <td className="text-right">{plan.count}</td>
                          <td className="text-right font-bold text-accent">
                            ${plan.revenue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {metrics.memberships.by_plan.length === 0 && (
                    <div className="text-center py-4 opacity-50">
                      Sin membresías activas
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card bg-base-100 shadow-md mb-8">
            <div className="card-body p-4">
              <h3 className="card-title text-lg">Actividad Reciente</h3>
              <div className="overflow-x-auto mt-2">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Estado</th>
                      <th className="text-right">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.recent_activity.map((member) => (
                      <tr key={member.id}>
                        <td className="font-medium">{member.full_name}</td>
                        <td>{member.email}</td>
                        <td>
                          <span className={`badge badge-${member.status === 'active' ? 'success' : member.status === 'trial' ? 'primary' : 'error'} badge-sm`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="text-right text-sm opacity-70">
                          {new Date(member.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {metrics.recent_activity.length === 0 && (
                  <div className="text-center py-4 opacity-50">
                    Sin actividad reciente
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Regular user view */}
      {user?.role !== 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="stat bg-base-100 shadow-sm rounded-box p-4">
            <div className="stat-title">Bienvenido</div>
            <div className="stat-value text-lg">{user?.full_name}</div>
            <div className="stat-desc">Rol: {user?.role}</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/members" className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow">
          <div className="card-body">
            <h2 className="card-title">📋 Gestión de Socios</h2>
            <p>Administra los miembros del gimnasio: altas, bajas y consultas.</p>
          </div>
        </Link>

        {user?.role === 'admin' && (
          <>
            <Link to="/plans" className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h2 className="card-title">📦 Planes</h2>
                <p>Configura y administra los planes disponibles.</p>
              </div>
            </Link>

            <Link to="/memberships" className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h2 className="card-title">💳 Membresías</h2>
                <p>Asigna y gestiona membresías a los socios.</p>
              </div>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}