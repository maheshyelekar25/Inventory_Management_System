export interface AuthUser {
  id: string
  full_name: string
  email: string
  role: 'admin'
}

export interface LoginResponse {
  access_token: string
  token_type: 'bearer'
  user: AuthUser
}
