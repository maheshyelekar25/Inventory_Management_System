import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required.').max(200, 'Name is too long.'),
  sku: z.string().trim().min(1, 'SKU is required.').max(100, 'SKU is too long.'),
  category_id: z.string().min(1, 'Select a category.'),
  price: z.coerce.number().min(0, 'Price cannot be negative.').max(99_999_999.99, 'Price is too high.'),
  quantity: z.coerce.number().int('Quantity must be a whole number.').min(0, 'Quantity cannot be negative.'),
  low_stock_threshold: z.coerce.number().int('Threshold must be a whole number.').min(0, 'Threshold cannot be negative.'),
})

export type ProductFormValues = z.infer<typeof productSchema>
