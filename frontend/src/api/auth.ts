import { apiClient } from '@/api/client'
import type { LoginResponse } from '@/types/auth'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload extends LoginPayload {
  full_name: string
}

export async function login(payload: LoginPayload) {
  const response = await apiClient.post<LoginResponse>('/auth/login', payload)
  return response.data
}

export async function register(payload: RegisterPayload) {
  await apiClient.post('/auth/register', payload)
  return login({ email: payload.email, password: payload.password })
}
