import type { AuthTokens } from '@/shared/api'

const ACCESS_TOKEN_KEY = 'dummyjson-access-token'
const REFRESH_TOKEN_KEY = 'dummyjson-refresh-token'
const USER_KEY = 'dummyjson-user'

export function readAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function readRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function readSessionUser<T>(): T | null {
  const value = localStorage.getItem(USER_KEY)
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch (error) {
    console.error('Unable to restore the saved user session.', error)
    clearStoredSession()
    return null
  }
}

export function writeSession<T>(user: T, tokens: AuthTokens): void {
  writeTokens(tokens)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function writeTokens(tokens: AuthTokens): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
  window.dispatchEvent(new CustomEvent<AuthTokens>('auth:tokens-refreshed', { detail: tokens }))
}

export function clearStoredSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
