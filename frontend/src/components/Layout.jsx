import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  LayoutDashboard,
  Users,
  Zap,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { path: '/', label: 'DASHBOARD', icon: LayoutDashboard },
  { path: '/members', label: 'SOCIOS', icon: Users },
]

const ADMIN_ITEMS = [
  { path: '/', label: 'ADMIN HUB', icon: ShieldCheck, adminOnly: true },
]

export default function Layout({ children }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = user?.role === 'admin'
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const items = isAdmin ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-glow overflow-x-hidden text-white flex flex-col font-sans relative pb-10">
      {/* Decorative ambient blurred circles */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0e0e0e]/95 backdrop-blur-md border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex justify-between items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(243,255,202,0.3)] shrink-0">
              <Zap className="w-5 h-5 text-black font-black fill-current" />
            </div>
            <div>
              <span className="font-headline font-black tracking-tighter text-glow text-lg leading-none block uppercase">
                GYM<span className="text-primary italic">BASE</span>
              </span>
              <span className="text-[9px] text-on-surface-variant font-black tracking-[0.2em] uppercase leading-none mt-1 pl-[1px] block">
                PERFORMANCE LOG
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 bg-surface-container-low p-1.5 rounded-full border border-outline-variant/10">
            {items.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path + item.label}
                  to={item.path}
                  className={`px-5 py-2.5 rounded-full font-headline font-semibold text-xs transition-all uppercase tracking-wider flex items-center gap-1.5 ${
                    isActive
                      ? 'text-black bg-primary font-bold shadow-md shadow-primary/10'
                      : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2.5 pl-2.5 border-l border-outline-variant/15 shrink-0">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                  {user?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold leading-none">
                    {user?.full_name}
                  </p>
                  <p className="text-[9px] text-[#ece856] font-bold mt-1.5 uppercase leading-none tracking-wider">
                    {isAdmin ? 'SUPERADMIN' : 'ATHLETE Tier'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="text-on-surface-variant hover:text-red-400 p-1.5 hover:bg-surface-container rounded-full active:scale-95 duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-on-surface-variant hover:text-white p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="lg:hidden fixed top-20 left-3 right-3 z-50 bg-[#161616]/95 backdrop-blur-md rounded-2xl p-3 border border-outline-variant/15 shadow-2xl flex flex-col gap-1 animate-fade-in">
          {items.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`px-5 py-3 rounded-xl font-headline font-semibold text-xs transition-all uppercase tracking-wider flex items-center gap-2 ${
                  isActive
                    ? 'text-black bg-primary font-bold'
                    : 'text-on-surface-variant hover:text-white hover:bg-surface-container-high'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      )}

      {/* Mobile Bottom Nav */}
      {user && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-50 bg-[#161616]/95 backdrop-blur-md rounded-full p-2 border border-outline-variant/15 shadow-2xl flex justify-around">
          {items.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                  isActive
                    ? 'text-primary text-glow font-black'
                    : 'text-on-surface-variant'
                }`}
              >
                <item.icon className="w-4.5 h-4.5" />
                <span>{item.label.slice(0, 6)}</span>
              </Link>
            )
          })}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-8 w-full z-10 relative">
        {children}
      </main>
    </div>
  )
}
