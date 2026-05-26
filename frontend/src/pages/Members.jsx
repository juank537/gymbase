import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../services/api'

export default function Members() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()
  const fmt = (d) => d ? new Date(d).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' }) : '—'

  const { data, isLoading } = useQuery({
    queryKey: ['members', page],
    queryFn: () => api.get(`/members?page=${page}&limit=8`).then(r => r.data)
  })

  const terminate = useMutation({
    mutationFn: (id) => api.patch(`/members/${id}/terminate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members'] })
  })

  const handleTerminate = (id, name) => {
    if (window.confirm(`¿Confirmar baja de ${name}? La fecha de baja será hoy.`)) {
      terminate.mutate(id)
    }
  }

  if (isLoading) return <span className="loading loading-spinner loading-lg mx-auto block mt-10"></span>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">👥 Gestión de Socios</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items.map(m => (
          <div key={m.id} className={`card bg-base-100 shadow-md border-l-4 ${m.status === 'cancelled' ? 'border-error' : 'border-success'}`}>
            <div className="card-body p-4">
              <div className="flex justify-between items-start">
                <h2 className="card-title text-lg">{m.full_name}</h2>
                <span className={`badge ${m.status === 'active' ? 'badge-success' : m.status === 'trial' ? 'badge-info' : 'badge-error'}`}>
                  {m.status}
                </span>
              </div>
              <p className="text-sm opacity-70">📞 {m.phone || 'Sin teléfono'}</p>
              
              <div className="mt-2 space-y-1 text-sm">
                <p>🟢 Alta: <span className="font-medium">{fmt(m.joined_at)}</span></p>
                {m.ended_at && <p>🔴 Baja: <span className="font-medium">{fmt(m.ended_at)}</span></p>}
              </div>

              {m.status !== 'cancelled' && (
                <button 
                  className="btn btn-error btn-outline btn-sm mt-3"
                  onClick={() => handleTerminate(m.id, m.full_name)}
                  disabled={terminate.isPending}
                >
                  Dar de baja
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-6">
        <button className="btn btn-sm" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Anterior</button>
        <span className="btn btn-ghost btn-sm cursor-default">Pág. {page}</span>
        <button className="btn btn-sm" disabled={data?.items.length < 8} onClick={()=>setPage(p=>p+1)}>Siguiente →</button>
      </div>
    </div>
  )
}