import { useEffect, useState } from 'react'

import { getCategories, getDashboardStatistics, getProducts } from '@/api/inventory'
import { getApiErrorMessage } from '@/api/client'
import { CategoryTable } from '@/features/dashboard/CategoryTable'
import { ProductTable } from '@/features/dashboard/ProductTable'
import { SummaryCard } from '@/features/dashboard/SummaryCard'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { INVENTORY_DATA_CHANGED } from '@/lib/events'
import type { Category, DashboardStatistics, Product } from '@/types/inventory'

const currency = (amount: string | number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount))

export function DashboardPage() {
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'low'>('all')
  const [isSummaryLoading, setIsSummaryLoading] = useState(true)
  const [isProductsLoading, setIsProductsLoading] = useState(true)
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)
  const [productError, setProductError] = useState<string | null>(null)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [refreshVersion, setRefreshVersion] = useState(0)
  const debouncedSearch = useDebouncedValue(search)

  useEffect(() => {
    const refresh = () => setRefreshVersion((version) => version + 1)
    window.addEventListener(INVENTORY_DATA_CHANGED, refresh)
    return () => window.removeEventListener(INVENTORY_DATA_CHANGED, refresh)
  }, [])

  useEffect(() => {
    let active = true
    Promise.all([getDashboardStatistics(), getCategories({ page_size: 100 })])
      .then(([dashboard, categoryPage]) => { if (active) { setStatistics(dashboard); setCategories(categoryPage.items) } })
      .catch((error) => { if (active) setCategoryError(getApiErrorMessage(error, 'Could not load dashboard data.')) })
      .finally(() => { if (active) { setIsSummaryLoading(false); setIsCategoriesLoading(false) } })
    return () => { active = false }
  }, [refreshVersion])

  useEffect(() => {
    let active = true
    setIsProductsLoading(true)
    setProductError(null)
    getProducts({ page: 1, page_size: 10, search: debouncedSearch || undefined, category_id: categoryId || undefined, low_stock: stockFilter === 'low' ? true : undefined })
      .then((page) => { if (active) setProducts(page.items) })
      .catch((error) => { if (active) setProductError(getApiErrorMessage(error, 'Could not load products.')) })
      .finally(() => { if (active) setIsProductsLoading(false) })
    return () => { active = false }
  }, [debouncedSearch, categoryId, stockFilter, refreshVersion])

  return <section className="space-y-8"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight">Dashboard</h1><p className="mt-1 text-slate-600">A real-time view of your inventory health.</p></div></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Total products" value={isSummaryLoading ? '—' : statistics?.total_products ?? 0} icon="◫" />
      <SummaryCard label="Categories" value={isSummaryLoading ? '—' : statistics?.total_categories ?? 0} icon="▤" />
      <SummaryCard label="Inventory units" value={isSummaryLoading ? '—' : statistics?.total_inventory_units ?? 0} icon="□" />
      <SummaryCard label="Low stock items" value={isSummaryLoading ? '—' : statistics?.low_stock_products ?? 0} icon="!" accent="amber" />
    </div>
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-3 lg:flex-row lg:items-end"><label className="flex-1 text-sm font-medium text-slate-700">Search products<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by product name or SKU" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-50" /></label><label className="text-sm font-medium text-slate-700">Category<select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-50 lg:w-52"><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="text-sm font-medium text-slate-700">Stock<select value={stockFilter} onChange={(event) => setStockFilter(event.target.value as 'all' | 'low')} className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-50 lg:w-40"><option value="all">All stock</option><option value="low">Low stock</option></select></label></div></div>
    <ProductTable products={products} isLoading={isProductsLoading} error={productError} />
    <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]"><CategoryTable categories={categories} isLoading={isCategoriesLoading} error={categoryError} /><aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">Inventory value</h2><p className="mt-2 text-3xl font-bold">{isSummaryLoading ? '—' : currency(statistics?.inventory_value ?? 0)}</p><p className="mt-2 text-sm text-slate-500">Total value across all products currently in stock.</p><div className="mt-6 border-t border-slate-100 pt-5"><p className="text-sm font-medium text-slate-700">Needs attention</p><p className="mt-1 text-sm text-slate-500">{statistics?.low_stock_products ?? 0} product(s) are at or below their low-stock threshold.</p></div></aside></section>
  </section>
}
