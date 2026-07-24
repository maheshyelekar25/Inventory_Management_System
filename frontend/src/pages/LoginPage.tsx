import { LoginForm } from '@/features/auth/LoginForm'
import { Link } from 'react-router-dom'

export function LoginPage() {
  return <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h1 className="text-2xl font-bold">Welcome back</h1><p className="mt-2 text-sm text-slate-600">Sign in to manage your inventory.</p><div className="mt-7"><LoginForm /></div><p className="mt-6 text-center text-sm text-slate-600">New here? <Link to="/register" className="font-semibold text-brand-700 hover:underline">Create an account</Link></p></section>
}
