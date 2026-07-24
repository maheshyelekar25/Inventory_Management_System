import { Link } from 'react-router-dom'

import { RegisterForm } from '@/features/auth/RegisterForm'

export function RegisterPage() {
  return <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h1 className="text-2xl font-bold">Create your account</h1><p className="mt-2 text-sm text-slate-600">Start managing your inventory in minutes.</p><div className="mt-7"><RegisterForm /></div><p className="mt-6 text-center text-sm text-slate-600">Already have an account? <Link to="/login" className="font-semibold text-brand-700 hover:underline">Sign in</Link></p></section>
}
