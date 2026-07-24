export interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Product {
  id: string
  category_id: string
  name: string
  sku: string
  price: string | number
  quantity: number
  low_stock_threshold: number
  created_at: string
  updated_at: string
  category: Category
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface DashboardStatistics {
  total_products: number
  total_categories: number
  total_inventory_units: number
  inventory_value: string | number
  low_stock_products: number
  low_stock_items: Product[]
}
