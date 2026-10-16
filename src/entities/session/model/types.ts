import type { AuthTokens } from '@/shared/api'

export type { AuthTokens } from '@/shared/api'

export interface SessionUser {
  id: number
  firstName: string
  lastName: string
  username: string
  email: string
  image?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export type LoginResponse = SessionUser & AuthTokens
