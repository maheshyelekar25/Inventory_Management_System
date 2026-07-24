import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'

import { getApiErrorMessage } from '@/api/client'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useAuth } from '@/context/AuthContext'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas'

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard'

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null)
    try {
      await login(values)
      navigate(from, { replace: true })
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Unable to sign in. Check your connection and try again.'))
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</div>}
      <label className="block text-sm font-medium text-slate-700">Email
        <input {...register('email')} type="email" autoComplete="email" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-50" aria-invalid={Boolean(errors.email)} />
        {errors.email && <span className="mt-1 block text-sm text-red-600">{errors.email.message}</span>}
      </label>
      <label className="block text-sm font-medium text-slate-700">Password
        <input {...register('password')} type="password" autoComplete="current-password" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-50" aria-invalid={Boolean(errors.password)} />
        {errors.password && <span className="mt-1 block text-sm text-red-600">{errors.password.message}</span>}
      </label>
      <button disabled={isSubmitting} className="flex w-full items-center justify-center rounded-md bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? <LoadingSpinner /> : 'Sign in'}
      </button>
    </form>
  )
}
