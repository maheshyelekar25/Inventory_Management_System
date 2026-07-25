import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import type { Product } from '@/types/inventory'

const stockAdjustmentSchema = z.object({
  movement_type: z.enum(['IN', 'OUT']),
  quantity: z.coerce.number().int('Quantity must be a whole number.').min(1, 'Quantity must be at least 1.'),
  reason: z.string().trim().min(1, 'Reason is required.').max(200, 'Reason is too long.'),
})

export type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentSchema>

interface StockAdjustmentFormProps {
  product: Product
  isSaving: boolean
  onSubmit: (values: StockAdjustmentFormValues) => Promise<void>
  onCancel: () => void
}

const defaults: StockAdjustmentFormValues = { movement_type: 'IN', quantity: 1, reason: '' }

export function StockAdjustmentForm({ product, isSaving, onSubmit, onCancel }: StockAdjustmentFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } =
  useForm({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: defaults,
  })

  useEffect(() => {
    reset(defaults)
  }, [product, reset])

  return <form onSubmit={handleSubmit(onSubmit)} noValidate><div className="grid gap-4 p-5 sm:grid-cols-1">
<div className="rounded-md bg-slate-50 px-3 py-2 border border-slate-200">
  <p className="text-sm font-medium text-slate-700">Adjusting stock for: {product.name}</p>
  <p className="mt-1 text-sm text-slate-600">Current quantity: <strong>{product.quantity}</strong> units</p>
</div>
<Field label="Movement Type" error={errors.movement_type?.message}><select {...register('movement_type')} className={inputClass} aria-invalid={Boolean(errors.movement_type)}>
  <option value="IN">Stock In (Add)</option>
  <option value="OUT">Stock Out (Remove)</option>
</select></Field>
<Field label="Quantity" error={errors.quantity?.message}><input
  {...register('quantity', { valueAsNumber: true })}
  type="number"
  min="1"
  step="1"
  className={inputClass}
  aria-invalid={Boolean(errors.quantity)}
/></Field>
<Field label="Reason" error={errors.reason?.message}><input
    {...register('reason')}
    placeholder="e.g. Restock, Damage, Return"
    className={inputClass}
    aria-invalid={Boolean(errors.reason)}
  /></Field>
</div><div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4"><button type="button" disabled={isSaving} onClick={onCancel} className="rounded-md px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50">Cancel</button><button disabled={isSaving} className="flex min-w-28 items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? <LoadingSpinner /> : 'Save adjustment'}</button></div></form>
}

const inputClass = 'mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-50'

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700">{label}{children}{error && <span className="mt-1 block text-sm text-red-600">{error}</span>}</label>
}
