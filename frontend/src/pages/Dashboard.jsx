import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { extractApiError } from '../utils/errorHandler'
import { Users, DollarSign, TrendingUp, Calendar, Activity, ShieldCheck } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'

export default function Dashboard() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(isAdmin)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isAdmin) return

    let cancelled = false

    const fetchMetrics = async () => {
      try {
        const { data } = await api.get('/metrics/dashboard')
        if (!cancelled) setMetrics(data)
      } catch (err) {
        if (!cancelled) setError(extractApiError(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchMetrics()

    return () => {
      cancelled = true
    }
  }, [isAdmin])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2rem] bg-surface-container-low p-8 md:p-12 border border-outline-variant/10">
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full opacity-15 pointer-events-none">
          <img
            className="w-full h-full object-cover mix-blend-lighten"
            alt="Atmospheric shot of high-end gym"
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-surface-container-low to-surface-container-low" />
        </div>

        <div className="relative z-10 max-w-xl">
          <Badge variant="primary" label="Panel de Control" className="mb-4" />
          <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter text-on-surface leading-none mb-4 uppercase">
            {isAdmin ? 'SALA DE' : 'BIENVENIDO,'}{' '}
            <span className="text-primary italic text-glow">
              {isAdmin ? 'CONTROL' : user?.full_name?.split(' ')[0]?.toUpperCase()}
            </span>
          </h1>
          <p className="text-on-surface-variant max-w-lg text-sm leading-relaxed mb-6">
            {isAdmin
              ? 'Vista holística del rendimiento corporativo de GymBase. Gestiona socios, monitorea ingresos y supervisa la plataforma.'
              : 'Accede a tus métricas, rutinas y seguimiento de rendimiento.'}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/members">
              <Button variant="primary" size="lg" icon={<Users className="w-4 h-4" />}>
                GESTIONAR SOCIOS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Admin alert banner */}
      {isAdmin && (
        <div className="bg-purple-950/25 border border-purple-800/40 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-purple-300">Modo Administrador Activado</h5>
              <p className="text-xs text-purple-400 mt-0.5 leading-relaxed">
                Tienes acceso a todas las vistas administrativas y métricas del sistema.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-950/30 border border-red-800/30 rounded-xl p-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-400 text-lg">error</span>
          <span className="text-red-400 text-xs font-medium">{error}</span>
          <button className="ml-auto text-red-400 hover:text-red-300" onClick={() => setError(null)}>
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      {isAdmin && metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Members */}
          <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant/5">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-primary text-[10px] font-bold tracking-widest uppercase flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> activos
              </span>
            </div>
            <span className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest leading-none block mb-1">
              Miembros Activos
            </span>
            <p className="font-headline text-3xl font-black text-on-surface">
              {metrics.overview.active_members}
            </p>
            <p className="text-[10px] text-on-surface-variant mt-2 font-medium">
              de {metrics.overview.total_members} total
            </p>
          </div>

          {/* New Members */}
          <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant/5">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
              <Badge variant="success" label="+30 días" />
            </div>
            <span className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest leading-none block mb-1">
              Nuevos (30 días)
            </span>
            <p className="font-headline text-3xl font-black text-emerald-400">
              +{metrics.members.new_last_30_days}
            </p>
            <p className="text-[10px] text-on-surface-variant mt-2 font-medium">
              {metrics.members.new_this_month} este mes
            </p>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant/5">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-[#ece856]/10 rounded-full flex items-center justify-center text-[#ece856]">
                <DollarSign className="w-5 h-5" />
              </div>
              <Badge variant="secondary" label="MRR" />
            </div>
            <span className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest leading-none block mb-1">
              Ingresos Mensuales
            </span>
            <p className="font-headline text-3xl font-black text-on-surface">
              ${metrics.overview.monthly_revenue.toLocaleString()}
            </p>
            <p className="text-[10px] text-on-surface-variant mt-2 font-medium">
              ${metrics.overview.revenue_this_month} este mes
            </p>
          </div>

          {/* Active Memberships */}
          <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant/5">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400">
                <Calendar className="w-5 h-5" />
              </div>
              <Badge variant="purple" label="ACTIVAS" />
            </div>
            <span className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest leading-none block mb-1">
              Membresías Activas
            </span>
            <p className="font-headline text-3xl font-black text-on-surface">
              {metrics.memberships.active}
            </p>
            <p className="text-[10px] text-on-surface-variant mt-2 font-medium">
              {metrics.memberships.total} totales
            </p>
          </div>
        </div>
      )}

      {/* Status & Plans Grid */}
      {isAdmin && metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Members by Status */}
          <Card variant="default">
            <h3 className="font-headline font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              Miembros por Estado
            </h3>
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex justify-between items-center p-3 rounded-xl bg-surface-container-low border border-outline-variant/5">
                <Badge variant="primary" label="Trial" />
                <span className="font-headline font-bold text-lg">{metrics.members.by_status.trial || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-surface-container-low border border-outline-variant/5">
                <Badge variant="success" label="Activos" />
                <span className="font-headline font-bold text-lg">{metrics.members.by_status.active || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-surface-container-low border border-outline-variant/5">
                <Badge variant="danger" label="Cancelados" />
                <span className="font-headline font-bold text-lg">{metrics.members.by_status.cancelled || 0}</span>
              </div>
            </div>
          </Card>

          {/* Memberships by Plan */}
          <Card variant="default" className="md:col-span-2">
            <h3 className="font-headline font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              Membresías por Plan
            </h3>
            <div className="overflow-x-auto mt-2">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/10">
                    <th className="text-left text-[10px] font-black uppercase tracking-widest text-on-surface-variant pb-3">Plan</th>
                    <th className="text-right text-[10px] font-black uppercase tracking-widest text-on-surface-variant pb-3">Miembros</th>
                    <th className="text-right text-[10px] font-black uppercase tracking-widest text-on-surface-variant pb-3">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.memberships.by_plan.map((plan, idx) => (
                    <tr key={idx} className="border-b border-outline-variant/5 last:border-0">
                      <td className="py-3 text-sm font-medium text-on-surface">{plan.plan_name}</td>
                      <td className="py-3 text-sm text-right text-on-surface-variant">{plan.count}</td>
                      <td className="py-3 text-sm text-right font-bold text-[#ece856]">
                        ${plan.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {metrics.memberships.by_plan.length === 0 && (
                <div className="text-center py-8 text-on-surface-variant text-sm">
                  Sin membresías activas
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      {isAdmin && metrics && (
        <section className="bg-surface-container rounded-3xl p-6 md:p-8 space-y-6 border border-outline-variant/10">
          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
            <h3 className="font-headline font-extrabold text-lg text-primary text-glow flex items-center gap-2">
              <span className="material-symbols-outlined leading-none text-xl">rss_feed</span>
              ACTIVIDAD RECIENTE
            </h3>
          </div>

          <div className="space-y-3">
            {metrics.recent_activity.map((member) => (
              <div
                key={member.id}
                className="flex justify-between items-center p-4 rounded-xl bg-surface-container-low border border-outline-variant/5 hover:bg-surface-container-high transition-all"
              >
                <div className="flex gap-3.5 items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {member.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-on-surface text-sm font-semibold">{member.full_name}</p>
                    <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mt-0.5">
                      {member.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      member.status === 'active'
                        ? 'success'
                        : member.status === 'trial'
                        ? 'primary'
                        : 'danger'
                    }
                    label={member.status}
                  />
                  <span className="text-[10px] font-bold text-on-surface-variant whitespace-nowrap">
                    {new Date(member.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {metrics.recent_activity.length === 0 && (
              <div className="text-center py-8 text-on-surface-variant text-sm">
                Sin actividad reciente
              </div>
            )}
          </div>
        </section>
      )}

      {/* Regular user view */}
      {!isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="low" glow>
            <div className="flex items-center gap-2 text-on-surface-variant mb-4">
              <span className="material-symbols-outlined text-sm text-primary">monitor_weight</span>
              <span className="font-headline text-[10px] font-bold uppercase tracking-widest">Bienvenido</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-headline text-4xl font-black text-on-surface">
                {user?.full_name?.split(' ')[0]}
              </span>
            </div>
            <p className="text-on-surface-variant text-xs mt-4 font-medium">
              Rol: {user?.role} — Email: {user?.email}
            </p>
          </Card>

          <Link to="/members" className="block">
            <Card variant="interactive" hoverEffect>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  Gestión de Socios
                </h3>
              </div>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                Administra los miembros del gimnasio: altas, bajas y consultas.
              </p>
            </Card>
          </Link>
        </div>
      )}
    </div>
  )
}
