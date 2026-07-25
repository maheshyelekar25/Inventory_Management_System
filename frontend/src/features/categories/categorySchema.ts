import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required.').max(200, 'Name is too long.'),
  description: z.string().trim().max(1000, 'Description is too long.').optional().or(z.literal('')),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
