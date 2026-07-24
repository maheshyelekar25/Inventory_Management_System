import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password must not exceed 72 characters.')
  .regex(/[A-Za-z]/, 'Password must include at least one letter.')
  .regex(/[0-9]/, 'Password must include at least one number.')

export const registerSchema = z.object({
  full_name: z.string().trim().min(2, 'Enter your full name.').max(100, 'Name is too long.'),
  email: z.email('Enter a valid email address.'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
})

export type RegisterFormValues = z.infer<typeof registerSchema>
