import { Link, Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <Link to="/login" className="mb-8 inline-flex items-center gap-2 text-lg font-bold text-brand-700">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm text-white">IM</span>
            Inventory Manager
          </Link>
          <Outlet />
        </div>
      </section>
      <aside className="hidden bg-brand-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/15 font-bold">IM</div>
        <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">Inventory, simplified</p><h2 className="mt-4 max-w-md text-4xl font-bold leading-tight">Know what you have, wherever your business takes you.</h2><p className="mt-5 max-w-md text-blue-100">Manage products, stock levels, and categories from one clear workspace.</p></div>
        <p className="text-sm text-blue-200">Secure access for your inventory team.</p>
      </aside>
    </main>
  )
}
