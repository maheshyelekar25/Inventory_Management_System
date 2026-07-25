import { apiClient } from '@/api/client'
import type { Category, DashboardStatistics, Page, Product } from '@/types/inventory'

export interface ProductFilters {
  page?: number
  page_size?: number
  search?: string
  category_id?: string
  low_stock?: boolean
}

export interface ProductPayload {
  category_id: string
  name: string
  sku: string
  price: number
  low_stock_threshold: number
}

export interface ProductCreatePayload extends ProductPayload {
  quantity: number
}

export interface CategoryPayload {
  name: string
  description?: string | null
}

export interface StockUpdatePayload {
  quantity: number
  movement_type: 'IN' | 'OUT'
  reason: string
}

export async function getDashboardStatistics() {
  const response = await apiClient.get<DashboardStatistics>('/dashboard/statistics', { params: { low_stock_limit: 5 } })
  return response.data
}

export async function getProducts(filters: ProductFilters = {}) {
  const response = await apiClient.get<Page<Product>>('/products', { params: filters })
  return response.data
}

export async function createProduct(payload: ProductCreatePayload) {
  const response = await apiClient.post<Product>('/products', payload)
  return response.data
}

export async function updateProduct(productId: string, payload: ProductPayload) {
  const response = await apiClient.patch<Product>(`/products/${productId}`, payload)
  return response.data
}

export async function deleteProduct(productId: string) {
  await apiClient.delete(`/products/${productId}`)
}

export async function getCategories(params: { page?: number; page_size?: number; search?: string } = {}) {
  const response = await apiClient.get<Page<Category>>('/categories', { params })
  return response.data
}

export async function createCategory(payload: CategoryPayload) {
  const response = await apiClient.post<Category>('/categories', payload)
  return response.data
}

export async function updateCategory(categoryId: string, payload: CategoryPayload) {
  const response = await apiClient.patch<Category>(`/categories/${categoryId}`, payload)
  return response.data
}

export async function deleteCategory(categoryId: string) {
  await apiClient.delete(`/categories/${categoryId}`)
}

export async function updateStock(productId: string, payload: StockUpdatePayload) {
  const response = await apiClient.post(`/products/${productId}/stock`, payload)
  return response.data
}
