import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'

import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { categorySchema, type CategoryFormValues } from '@/features/categories/categorySchema'
import type { Category } from '@/types/inventory'

interface CategoryFormProps {
  category?: Category | null
  isSaving: boolean
  onSubmit: (values: CategoryFormValues) => Promise<void>
  onCancel: () => void
}

const defaults: CategoryFormValues = { name: '', description: '' }

export function CategoryForm({ category, isSaving, onSubmit, onCancel }: CategoryFormProps) {
  const isEditing = Boolean(category)
  const { register, handleSubmit, reset, formState: { errors } } =
  useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: defaults,
  })

  useEffect(() => {
    reset(category ? { name: category.name, description: category.description ?? '' } : defaults)
  }, [category, reset])

  return <form onSubmit={handleSubmit(onSubmit)} noValidate><div className="grid gap-4 p-5 sm:grid-cols-1"><Field label="Category name" error={errors.name?.message}><input {...register('name')} autoFocus className={inputClass} aria-invalid={Boolean(errors.name)} /></Field><Field label="Description" error={errors.description?.message}><textarea {...register('description')} rows={3} className={inputClass} aria-invalid={Boolean(errors.description)} /></Field></div><div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4"><button type="button" disabled={isSaving} onClick={onCancel} className="rounded-md px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50">Cancel</button><button disabled={isSaving} className="flex min-w-28 items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? <LoadingSpinner /> : isEditing ? 'Save changes' : 'Add category'}</button></div></form>
}

const inputClass = 'mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-50'

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700">{label}{children}{error && <span className="mt-1 block text-sm text-red-600">{error}</span>}</label>
}
