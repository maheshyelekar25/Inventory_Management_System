import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center"><section className="w-full max-w-lg"><p className="text-7xl font-black tracking-tighter text-brand-100 sm:text-9xl">404</p><h1 className="-mt-5 text-3xl font-bold tracking-tight sm:text-4xl">This page is off the shelf</h1><p className="mx-auto mt-4 max-w-md leading-7 text-slate-600">The address may be incorrect, or the page may have moved. Let’s get you back to your inventory.</p><Link to="/dashboard" className="mt-7 inline-flex rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700">Return to dashboard</Link></section></main>
}
