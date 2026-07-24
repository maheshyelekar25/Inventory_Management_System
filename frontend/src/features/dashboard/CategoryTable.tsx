import type { Category } from '@/types/inventory'
import { TableSkeleton } from '@/components/common/Skeleton'

interface CategoryTableProps {
  categories: Category[]
  isLoading: boolean
  error: string | null
}

export function CategoryTable({ categories, isLoading, error }: CategoryTableProps) {
  return <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold">Categories</h2><p className="mt-1 text-sm text-slate-500">Your active product groupings</p></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Name</th><th className="px-5 py-3 font-semibold">Description</th><th className="px-5 py-3 font-semibold">Created</th></tr></thead><tbody className="divide-y divide-slate-100">
    {isLoading && <TableSkeleton columns={3} rows={3} />}
    {error && <tr><td colSpan={3} className="px-5 py-8 text-center text-red-600">{error}</td></tr>}
    {!isLoading && !error && categories.length === 0 && <tr><td colSpan={3} className="px-5 py-8 text-center text-slate-500">No categories found.</td></tr>}
    {!isLoading && !error && categories.map((category) => <tr key={category.id}><td className="px-5 py-4 font-medium text-slate-900">{category.name}</td><td className="max-w-xs truncate px-5 py-4 text-slate-600">{category.description ?? '—'}</td><td className="whitespace-nowrap px-5 py-4 text-slate-600">{new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(category.created_at))}</td></tr>)}
  </tbody></table></div></section>
}
