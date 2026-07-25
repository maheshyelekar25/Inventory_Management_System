import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'

import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { productSchema, type ProductFormValues } from '@/features/products/productSchema'
import type { Category, Product } from '@/types/inventory'

interface ProductFormProps {
  product?: Product | null
  categories: Category[]
  isSaving: boolean
  onSubmit: (values: ProductFormValues) => Promise<void>
  onCancel: () => void
}

const defaults: ProductFormValues = { name: '', sku: '', category_id: '', price: 0, quantity: 0, low_stock_threshold: 10 }

export function ProductForm({ product, categories, isSaving, onSubmit, onCancel }: ProductFormProps) {
  const isEditing = Boolean(product)
  const { register, handleSubmit, reset, formState: { errors } } =
  useForm({
    resolver: zodResolver(productSchema),
    defaultValues: defaults,
  })

  useEffect(() => {
    reset(product ? { name: product.name, sku: product.sku, category_id: product.category_id, price: Number(product.price), quantity: product.quantity, low_stock_threshold: product.low_stock_threshold } : defaults)
  }, [product, reset])

  return <form onSubmit={handleSubmit(onSubmit)} noValidate><div className="grid gap-4 p-5 sm:grid-cols-2"><Field label="Product name" error={errors.name?.message}><input {...register('name')} autoFocus className={inputClass} aria-invalid={Boolean(errors.name)} /></Field><Field label="SKU (e.g. MOU-LOG-001)" error={errors.sku?.message}>
  <input
    {...register('sku')}
    placeholder="e.g. MOU-LOG-001"
    className={inputClass}
    aria-invalid={Boolean(errors.sku)}
  />
</Field><Field label="Category" error={errors.category_id?.message}><select {...register('category_id')} className={inputClass} aria-invalid={Boolean(errors.category_id)}><option value="">Select a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field><Field label="Price (₹)" error={errors.price?.message}><input
  {...register('price', { valueAsNumber: true })}
  type="number"
  min="0"
  step="0.01"
  className={inputClass}
  aria-invalid={Boolean(errors.price)}
/></Field>{isEditing ? <div className="rounded-md bg-slate-50 px-3 py-2"><p className="text-sm font-medium text-slate-700">Current quantity</p><p className="mt-1 text-sm text-slate-600">{product?.quantity} units <span className="text-slate-400">(use stock adjustment to change)</span></p></div> : <Field label="Opening quantity" error={errors.quantity?.message}><input
  {...register('quantity', { valueAsNumber: true })}
  type="number"
  min="0"
  step="1"
  className={inputClass}
  aria-invalid={Boolean(errors.quantity)}
/></Field>}<Field label="Low-stock threshold" error={errors.low_stock_threshold?.message}><input
  {...register('low_stock_threshold', { valueAsNumber: true })}
  type="number"
  min="0"
  step="1"
  className={inputClass}
  aria-invalid={Boolean(errors.low_stock_threshold)}
/></Field></div><div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4"><button type="button" disabled={isSaving} onClick={onCancel} className="rounded-md px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50">Cancel</button><button disabled={isSaving || categories.length === 0} className="flex min-w-28 items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? <LoadingSpinner /> : isEditing ? 'Save changes' : 'Add product'}</button></div>{categories.length === 0 && <p className="px-5 pb-4 text-sm text-amber-700">Create a category before adding a product.</p>}</form>
}

const inputClass = 'mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-50'

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700">{label}{children}{error && <span className="mt-1 block text-sm text-red-600">{error}</span>}</label>
}
