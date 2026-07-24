import { NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'

const navigation = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/products', label: 'Products' },
  { to: '/categories', label: 'Categories' },
]

export function AppLayout() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <NavLink to="/dashboard" className="flex items-center gap-2 text-lg font-bold text-brand-700"><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-xs text-white">IM</span><span className="hidden sm:inline">Inventory Manager</span></NavLink>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-slate-600 sm:block">{user?.full_name}</span>
            <button onClick={logout} className="rounded-md px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-100">Sign out</button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
        <nav className="mb-5 flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 md:hidden">
          {navigation.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}>{item.label}</NavLink>)}
        </nav>
        <div className="flex gap-8">
        <nav className="hidden w-40 shrink-0 space-y-1 md:block">
          {navigation.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `block rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}>{item.label}</NavLink>)}
        </nav>
        <main className="min-w-0 flex-1 page-enter"><Outlet /></main>
        </div>
      </div>
    </div>
  )
}
