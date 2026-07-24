import type { Product } from '@/types/inventory'

import { LowStockBadge } from '@/features/dashboard/LowStockBadge'
import { TableSkeleton } from '@/components/common/Skeleton'

interface ProductTableProps {
  products: Product[]
  isLoading: boolean
  error: string | null
}

const formatCurrency = (amount: string | number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(amount))

export function ProductTable({ products, isLoading, error }: ProductTableProps) {
  return <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold">Products</h2><p className="mt-1 text-sm text-slate-500">Latest inventory matching your filters</p></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Product</th><th className="px-5 py-3 font-semibold">Category</th><th className="px-5 py-3 font-semibold">SKU</th><th className="px-5 py-3 font-semibold">Price</th><th className="px-5 py-3 font-semibold">Stock</th><th className="px-5 py-3 font-semibold">Status</th></tr></thead><tbody className="divide-y divide-slate-100">
    {isLoading && <TableSkeleton columns={6} />}
    {error && <tr><td colSpan={6} className="px-5 py-10 text-center text-red-600">{error}</td></tr>}
    {!isLoading && !error && products.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">No products match these filters.</td></tr>}
    {!isLoading && !error && products.map((product) => <tr key={product.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-medium text-slate-900">{product.name}</td><td className="px-5 py-4 text-slate-600">{product.category.name}</td><td className="px-5 py-4 font-mono text-xs text-slate-600">{product.sku}</td><td className="px-5 py-4 text-slate-700">{formatCurrency(product.price)}</td><td className="px-5 py-4 text-slate-700">{product.quantity} <span className="text-slate-400">/ {product.low_stock_threshold}</span></td><td className="px-5 py-4"><LowStockBadge quantity={product.quantity} threshold={product.low_stock_threshold} /></td></tr>)}
  </tbody></table></div></section>
}
