import {
  clearStoredSession,
  readAccessToken,
  readRefreshToken,
  writeTokens,
} from '@/shared/config'
import type { AuthTokens } from './auth-types'

interface RefreshResponse extends AuthTokens {}

const API_URL = import.meta.env.VITE_API_URL

async function refreshAccessToken(): Promise<string> {
  const refreshToken = readRefreshToken()
  if (!refreshToken) {
    throw new Error('Сесію завершено. Увійдіть знову.')
  }

  const response = await fetch(`${getApiUrl()}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken, expiresInMins: 30 }),
  })

  if (!response.ok) {
    clearStoredSession()
    window.dispatchEvent(new Event('auth:expired'))
    throw new Error(`Не вдалося оновити сесію: HTTP ${response.status} ${response.statusText}`)
  }

  const tokens = (await response.json()) as RefreshResponse
  writeTokens(tokens)
  return tokens.accessToken
}

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error('Не задано VITE_API_URL. Додайте адресу API до файлу .env.')
  }
  return API_URL.replace(/\/$/, '')
}

async function send<T>(path: string, options: RequestInit, allowRefresh: boolean): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const token = readAccessToken()
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${getApiUrl()}${path}`, { ...options, headers })

  if (response.status === 401 && allowRefresh && readRefreshToken()) {
    const freshToken = await refreshAccessToken()
    headers.set('Authorization', `Bearer ${freshToken}`)
    return send<T>(path, { ...options, headers }, false)
  }

  if (!response.ok) {
    const message = `${response.status} ${response.statusText}`.trim()
    throw new Error(`HTTP ${message}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  return send<T>(path, options, true)
}
