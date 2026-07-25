import { useEffect, useState } from 'react'

import { createCategory, deleteCategory, getCategories, updateCategory } from '@/api/inventory'
import { getApiErrorMessage } from '@/api/client'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Modal } from '@/components/common/Modal'
import { TableSkeleton } from '@/components/common/Skeleton'
import { useToast } from '@/context/ToastContext'
import { CategoryForm } from '@/features/categories/CategoryForm'
import type { CategoryFormValues } from '@/features/categories/categorySchema'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { notifyInventoryDataChanged } from '@/lib/events'
import type { Category } from '@/types/inventory'

export function CategoriesPage() {
  const { showToast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [modalCategory, setModalCategory] = useState<Category | null | undefined>(undefined)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const debouncedSearch = useDebouncedValue(search)

  const loadCategories = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getCategories({ page: 1, page_size: 100, search: debouncedSearch || undefined })
      setCategories(response.items)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not load categories.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { void loadCategories() }, [debouncedSearch])

  const saveCategory = async (values: CategoryFormValues) => {
    setIsSaving(true)
    try {
      if (modalCategory) {
        await updateCategory(modalCategory.id, { name: values.name, description: values.description })
        showToast('Category updated successfully.')
      } else {
        await createCategory(values)
        showToast('Category added successfully.')
      }
      setModalCategory(undefined)
      await loadCategories()
      notifyInventoryDataChanged()
    } catch (requestError) {
      showToast(getApiErrorMessage(requestError, 'Could not save category.'), 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return
    setIsDeleting(true)
    try {
      await deleteCategory(categoryToDelete.id)
      showToast('Category deleted successfully.')
      setCategoryToDelete(null)
      await loadCategories()
      notifyInventoryDataChanged()
    } catch (requestError) {
      showToast(getApiErrorMessage(requestError, 'Could not delete category. Make sure no products are using it.'), 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return <section className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight">Categories</h1><p className="mt-1 text-slate-600">Create and manage your product categories.</p></div><button onClick={() => setModalCategory(null)} className="rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700">+ Add category</button></div><section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"><label className="w-full sm:max-w-sm"><span className="sr-only">Search categories</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search categories" className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-50" /></label><p className="text-sm text-slate-500">{categories.length} categor{categories.length === 1 ? 'y' : 'ies'}</p></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Description</th><th className="px-5 py-3">Created</th><th className="px-5 py-3"><span className="sr-only">Actions</span></th></tr></thead><tbody className="divide-y divide-slate-100">{isLoading && <TableSkeleton columns={4} />}{error && <tr><td colSpan={4} className="px-5 py-12 text-center text-red-600">{error}</td></tr>}{!isLoading && !error && categories.length === 0 && <tr><td colSpan={4} className="px-5 py-12 text-center"><p className="font-medium text-slate-700">No categories found</p><p className="mt-1 text-sm text-slate-500">Add your first category or try a different search.</p></td></tr>}{!isLoading && !error && categories.map((category) => <tr key={category.id} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="font-medium text-slate-900">{category.name}</p></td><td className="max-w-xs truncate px-5 py-4 text-slate-600">{category.description ?? '—'}</td><td className="whitespace-nowrap px-5 py-4 text-slate-600">{new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(category.created_at))}</td><td className="whitespace-nowrap px-5 py-4 text-right"><button onClick={() => setModalCategory(category)} className="mr-3 text-sm font-semibold text-brand-700 hover:underline">Edit</button><button onClick={() => setCategoryToDelete(category)} className="text-sm font-semibold text-red-600 hover:underline">Delete</button></td></tr>)}</tbody></table></div></section>{modalCategory !== undefined && <Modal title={modalCategory ? 'Edit category' : 'Add category'} onClose={() => !isSaving && setModalCategory(undefined)}><CategoryForm category={modalCategory} isSaving={isSaving} onSubmit={saveCategory} onCancel={() => setModalCategory(undefined)} /></Modal>}{categoryToDelete && <ConfirmDialog title="Delete category?" message={`This will permanently delete “${categoryToDelete.name}”. This action cannot be undone.`} isBusy={isDeleting} onConfirm={confirmDelete} onClose={() => setCategoryToDelete(null)} />}</section>
}
