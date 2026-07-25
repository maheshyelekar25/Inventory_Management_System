import { useEffect, useState } from 'react'

import { createProduct, deleteProduct, getCategories, getProducts, updateProduct, updateStock } from '@/api/inventory'
import { getApiErrorMessage } from '@/api/client'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Modal } from '@/components/common/Modal'
import { TableSkeleton } from '@/components/common/Skeleton'
import { useToast } from '@/context/ToastContext'
import { ProductForm } from '@/features/products/ProductForm'
import type { ProductFormValues } from '@/features/products/productSchema'
import { StockAdjustmentForm, type StockAdjustmentFormValues } from '@/features/products/StockAdjustmentForm'
import { LowStockBadge } from '@/features/dashboard/LowStockBadge'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { notifyInventoryDataChanged } from '@/lib/events'
import type { Category, Product } from '@/types/inventory'

const money = (amount: string | number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount))

export function ProductsPage() {
  const { showToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [modalProduct, setModalProduct] = useState<Product | null | undefined>(undefined)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [adjustmentProduct, setAdjustmentProduct] = useState<Product | null>(null)
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'low'>('all')
  const debouncedSearch = useDebouncedValue(search)

  const loadProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getProducts({ page: 1, page_size: 100, search: debouncedSearch || undefined, category_id: categoryId || undefined, low_stock: stockFilter === 'low' ? true : undefined })
      setProducts(response.items)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not load products.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { void loadProducts() }, [debouncedSearch, categoryId, stockFilter])
  useEffect(() => { getCategories({ page: 1, page_size: 100 }).then((response) => setCategories(response.items)).catch(() => showToast('Could not load categories.', 'error')) }, [showToast])

  const saveProduct = async (values: ProductFormValues) => {
    setIsSaving(true)
    try {
      if (modalProduct) {
        await updateProduct(modalProduct.id, { name: values.name, sku: values.sku, category_id: values.category_id, price: values.price, low_stock_threshold: values.low_stock_threshold })
        showToast('Product updated successfully.')
      } else {
        await createProduct(values)
        showToast('Product added successfully.')
      }
      setModalProduct(undefined)
      await loadProducts()
      notifyInventoryDataChanged()
    } catch (requestError) {
      showToast(getApiErrorMessage(requestError, 'Could not save product.'), 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!productToDelete) return
    setIsDeleting(true)
    try {
      await deleteProduct(productToDelete.id)
      showToast('Product deleted successfully.')
      setProductToDelete(null)
      await loadProducts()
      notifyInventoryDataChanged()
    } catch (requestError) {
      showToast(getApiErrorMessage(requestError, 'Could not delete product.'), 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const saveAdjustment = async (values: StockAdjustmentFormValues) => {
    if (!adjustmentProduct) return
    setIsAdjusting(true)
    try {
      await updateStock(adjustmentProduct.id, values)
      showToast('Stock adjusted successfully.')
      setAdjustmentProduct(null)
      await loadProducts()
      notifyInventoryDataChanged()
    } catch (requestError) {
      showToast(getApiErrorMessage(requestError, 'Could not adjust stock.'), 'error')
    } finally {
      setIsAdjusting(false)
    }
  }

  return <section className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight">Products</h1><p className="mt-1 text-slate-600">Create, update, and track your inventory.</p></div><button onClick={() => setModalProduct(null)} className="rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700">+ Add product</button></div><section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center"><label className="w-full sm:max-w-xs"><span className="sr-only">Search products</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products or SKU" className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-50" /></label><label className="w-full sm:max-w-xs"><span className="sr-only">Category</span><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-50"><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="w-full sm:max-w-[150px]"><span className="sr-only">Stock</span><select value={stockFilter} onChange={(event) => setStockFilter(event.target.value as 'all' | 'low')} className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-50"><option value="all">All stock</option><option value="low">Low stock</option></select></label><div className="flex-1"></div><p className="text-sm text-slate-500 whitespace-nowrap">{products.length} product{products.length === 1 ? '' : 's'}</p></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Product</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Quantity</th><th className="px-5 py-3">Status</th><th className="px-5 py-3"><span className="sr-only">Actions</span></th></tr></thead><tbody className="divide-y divide-slate-100">{isLoading && <TableSkeleton columns={6} />}{error && <tr><td colSpan={6} className="px-5 py-12 text-center text-red-600">{error}</td></tr>}{!isLoading && !error && products.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center"><p className="font-medium text-slate-700">No products found</p><p className="mt-1 text-sm text-slate-500">Add your first product or try a different search.</p></td></tr>}{!isLoading && !error && products.map((product) => <tr key={product.id} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="font-medium text-slate-900">{product.name}</p><p className="mt-0.5 font-mono text-xs text-slate-500">{product.sku}</p></td><td className="px-5 py-4 text-slate-600">{product.category.name}</td><td className="px-5 py-4 text-slate-700">{money(product.price)}</td><td className="px-5 py-4 text-slate-700">{product.quantity}</td><td className="px-5 py-4"><LowStockBadge quantity={product.quantity} threshold={product.low_stock_threshold} /></td><td className="whitespace-nowrap px-5 py-4 text-right"><button onClick={() => setAdjustmentProduct(product)} className="mr-3 text-sm font-semibold text-brand-700 hover:underline">Adjust</button><button onClick={() => setModalProduct(product)} className="mr-3 text-sm font-semibold text-brand-700 hover:underline">Edit</button><button onClick={() => setProductToDelete(product)} className="text-sm font-semibold text-red-600 hover:underline">Delete</button></td></tr>)}</tbody></table></div></section>{modalProduct !== undefined && <Modal title={modalProduct ? 'Edit product' : 'Add product'} onClose={() => !isSaving && setModalProduct(undefined)}><ProductForm product={modalProduct} categories={categories} isSaving={isSaving} onSubmit={saveProduct} onCancel={() => setModalProduct(undefined)} /></Modal>}{productToDelete && <ConfirmDialog title="Delete product?" message={`This will permanently delete “${productToDelete.name}” and its stock history. This action cannot be undone.`} isBusy={isDeleting} onConfirm={confirmDelete} onClose={() => setProductToDelete(null)} />}{adjustmentProduct && <Modal title="Adjust Stock" onClose={() => !isAdjusting && setAdjustmentProduct(null)}><StockAdjustmentForm product={adjustmentProduct} isSaving={isAdjusting} onSubmit={saveAdjustment} onCancel={() => setAdjustmentProduct(null)} /></Modal>}</section>
}
