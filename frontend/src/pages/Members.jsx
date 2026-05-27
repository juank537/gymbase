import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../services/api'
import { extractApiError } from '../utils/errorHandler'
import { Search, Eye, X, Users, UserMinus } from 'lucide-react'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'

export default function Members() {
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL')
  const [activeClientDetail, setActiveClientDetail] = useState(null)
  const queryClient = useQueryClient()
  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '—'

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ['members', page],
    queryFn: () => api.get(`/members?page=${page}&limit=8`).then((r) => r.data),
  })

  const terminate = useMutation({
    mutationFn: (id) => api.patch(`/members/${id}/terminate`),
    onSuccess: () => {
      setActionError('')
      queryClient.invalidateQueries({ queryKey: ['members'] })
      setActiveClientDetail(null)
    },
    onError: (err) => setActionError(extractApiError(err)),
  })

  const handleTerminate = (id, name) => {
    if (window.confirm(`¿Confirmar baja de ${name}? La fecha de baja será hoy.`)) {
      setActionError('')
      terminate.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  const displayError = actionError || (queryError ? extractApiError(queryError) : '')

  const items = data?.items || []
  const filteredItems =
    selectedStatusTab === 'ALL'
      ? items
      : items.filter((m) => m.status === selectedStatusTab)

  const searchFiltered = searchTerm
    ? filteredItems.filter(
        (m) =>
          m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredItems

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-primary font-headline font-bold uppercase tracking-widest text-xs mb-2 block">
            CRM DE SOCIOS GYMBASE
          </span>
          <h2 className="font-headline text-4xl font-black text-on-surface tracking-tighter uppercase leading-none">
            CENTRO DE SOCIOS
          </h2>
          <p className="text-on-surface-variant text-xs mt-1">
            Administra altas, bajas y consultas de los miembros del gimnasio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">
            Pág. {page}
          </span>
        </div>
      </section>

      {/* Error */}
      {displayError && (
        <div className="bg-red-950/30 border border-red-800/30 rounded-xl p-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-400 text-lg">error</span>
          <span className="text-red-400 text-xs font-medium">{displayError}</span>
          <button
            className="ml-auto text-red-400 hover:text-red-300"
            onClick={() => setActionError('')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex bg-surface-container p-1 rounded-full border border-outline-variant/10 overflow-x-auto no-scrollbar">
          {['ALL', 'active', 'trial', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedStatusTab(tab)}
              className={`px-5 py-2 rounded-full font-headline font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedStatusTab === tab
                  ? 'bg-primary text-black text-glow'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              {tab === 'ALL'
                ? 'Todos'
                : tab === 'active'
                ? 'Activos'
                : tab === 'trial'
                ? 'Trial'
                : 'Cancelados'}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/15 rounded-full py-3.5 pl-11 pr-5 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/20 outline-none"
          />
          <Search className="w-4 h-4 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cards list */}
        <section
          className={`${
            activeClientDetail ? 'lg:col-span-7' : 'lg:col-span-12'
          } space-y-4`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchFiltered.map((m) => {
              const isSelected = activeClientDetail?.id === m.id
              return (
                <div
                  key={m.id}
                  onClick={() => setActiveClientDetail(m)}
                  className={`p-5 rounded-2xl bg-surface-container-low border transition-all cursor-pointer flex justify-between items-center group ${
                    isSelected
                      ? 'border-primary/50 bg-surface-container-high ring-2 ring-primary/10 shadow-lg'
                      : 'border-outline-variant/10 hover:border-outline-variant/25 hover:bg-surface-container/15'
                  }`}
                >
                  <div className="flex gap-3.5 items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0 border border-primary/20">
                      {m.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface group-hover:text-primary transition-all text-sm leading-tight font-headline">
                        {m.full_name}
                      </h4>
                      <p className="text-xs text-on-surface-variant line-clamp-1 leading-normal">
                        {m.email}
                      </p>
                      <span
                        className={`inline-block text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase mt-2 tracking-widest ${
                          m.status === 'active'
                            ? 'bg-primary/15 text-primary'
                            : m.status === 'trial'
                            ? 'bg-[#ece856]/15 text-[#ece856]'
                            : 'bg-red-950/20 text-red-400'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                  </div>

                  <button className="p-2.5 bg-surface-container rounded-full text-on-surface-variant group-hover:text-primary transition-all duration-200">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              )
            })}

            {searchFiltered.length === 0 && (
              <p className="md:col-span-2 text-on-surface-variant text-center text-sm font-medium py-16 italic">
                No se encontraron socios que coincidan con la búsqueda.
              </p>
            )}
          </div>
        </section>

        {/* Detail Panel */}
        {activeClientDetail && (
          <section className="lg:col-span-5 bg-surface-container rounded-3xl p-6 md:p-8 space-y-6 border border-primary/10 animate-fade-in w-full">
            <div className="flex justify-between items-start border-b border-outline-variant/10 pb-4">
              <h4 className="font-headline font-black text-glow text-primary uppercase text-sm">
                FICHA DEL SOCIO
              </h4>
              <button
                onClick={() => setActiveClientDetail(null)}
                className="text-on-surface-variant hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar & Header */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl border-2 border-primary shadow-lg shadow-primary/5">
                {activeClientDetail.full_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h3 className="font-headline font-extrabold text-xl text-on-surface leading-tight">
                  {activeClientDetail.full_name}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  {activeClientDetail.email}
                </p>
              </div>

              <div className="flex gap-2">
                <Badge
                  variant={
                    activeClientDetail.status === 'active'
                      ? 'success'
                      : activeClientDetail.status === 'trial'
                      ? 'primary'
                      : 'danger'
                  }
                  label={activeClientDetail.status.toUpperCase()}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3.5 text-center">
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/10">
                <span className="material-symbols-outlined text-primary text-xl">event</span>
                <p className="font-headline font-bold text-sm mt-1">{fmt(activeClientDetail.joined_at)}</p>
                <p className="text-[9px] text-on-surface-variant uppercase font-black tracking-widest mt-1">
                  FECHA ALTA
                </p>
              </div>

              <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/10 flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-[#ece856] text-xl">phone</span>
                  <p className="font-headline font-bold text-sm mt-1 truncate">
                    {activeClientDetail.phone || 'Sin teléfono'}
                  </p>
                </div>
                <p className="text-[9px] text-on-surface-variant uppercase font-black tracking-widest mt-1.5">
                  TELÉFONO
                </p>
              </div>
            </div>

            {/* End date */}
            {activeClientDetail.ended_at && (
              <div className="bg-red-950/20 p-4 rounded-xl border border-red-800/20 text-center">
                <p className="text-[9px] text-red-400 uppercase font-black tracking-widest">
                  FECHA DE BAJA
                </p>
                <p className="font-headline font-bold text-red-400 mt-1">
                  {fmt(activeClientDetail.ended_at)}
                </p>
              </div>
            )}

            {/* Terminate button */}
            {activeClientDetail.status !== 'cancelled' && (
              <Button
                variant="danger"
                fullWidth
                size="sm"
                icon={<UserMinus className="w-4 h-4" />}
                onClick={() =>
                  handleTerminate(activeClientDetail.id, activeClientDetail.full_name)
                }
                disabled={terminate.isPending}
              >
                {terminate.isPending ? 'Procesando...' : 'DAR DE BAJA'}
              </Button>
            )}
          </section>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          ANTERIOR
        </Button>
        <span className="px-5 py-2.5 rounded-full font-headline font-bold text-xs text-on-surface-variant bg-surface-container border border-outline-variant/10">
          Pág. {page}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={data?.items?.length < 8}
          onClick={() => setPage((p) => p + 1)}
        >
          SIGUIENTE
        </Button>
      </div>
    </div>
  )
}
