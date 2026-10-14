import type { AuthTokens, User } from '../types'

const ACCESS_TOKEN_KEY = 'dummyjson-access-token'
const REFRESH_TOKEN_KEY = 'dummyjson-refresh-token'
const USER_KEY = 'dummyjson-user'

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getStoredUser(): User | null {
  const storedUser = localStorage.getItem(USER_KEY)
  if (!storedUser) return null

  try {
    return JSON.parse(storedUser) as User
  } catch (error) {
    console.error('Unable to restore the saved user session.', error)
    clearAuthStorage()
    return null
  }
}

export function saveAuthSession(user: User, tokens: AuthTokens): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function saveAuthTokens(tokens: AuthTokens): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
  window.dispatchEvent(new CustomEvent<AuthTokens>('auth:tokens-refreshed', { detail: tokens }))
}

export function clearAuthStorage(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
