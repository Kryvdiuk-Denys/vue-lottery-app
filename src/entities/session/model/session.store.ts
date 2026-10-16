import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { clearStoredSession, readAccessToken, readRefreshToken, readSessionUser, writeSession } from '@/shared/config'
import { ServiceProvider } from '@/shared/api'
import { AuthService } from '../api'
import type { AuthTokens, LoginCredentials, SessionUser } from './types'

export const useSessionStore = defineStore('session', () => {
  const accessToken = ref<string | null>(readAccessToken())
  const refreshToken = ref<string | null>(readRefreshToken())
  const currentUser = ref<SessionUser | null>(readSessionUser<SessionUser>())
  const isInitialized = ref(false)
  const initializationError = ref('')
  const isAuthenticated = computed(() => Boolean(accessToken.value && currentUser.value))

  if (typeof window !== 'undefined') {
    window.addEventListener('auth:tokens-refreshed', (event) => {
      const tokens = (event as CustomEvent<AuthTokens>).detail
      accessToken.value = tokens.accessToken
      refreshToken.value = tokens.refreshToken
    })

    window.addEventListener('auth:expired', () => clearSession())
  }

  function setSession(user: SessionUser, tokens: AuthTokens): void {
    currentUser.value = user
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    writeSession(user, tokens)
    initializationError.value = ''
  }

  function clearSession(): void {
    accessToken.value = null
    refreshToken.value = null
    currentUser.value = null
    clearStoredSession()
  }

  async function initialize(): Promise<void> {
    if (isInitialized.value) return
    if (!accessToken.value) {
      isInitialized.value = true
      return
    }

    try {
      currentUser.value = await ServiceProvider.get<AuthService>('auth').me()
    } catch (cause) {
      clearSession()
      initializationError.value =
        cause instanceof Error ? cause.message : 'Не вдалося перевірити авторизацію.'
    } finally {
      isInitialized.value = true
    }
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    const response = await ServiceProvider.get<AuthService>('auth').login(credentials)
    const { accessToken: nextAccessToken, refreshToken: nextRefreshToken, ...user } = response
    setSession(user, { accessToken: nextAccessToken, refreshToken: nextRefreshToken })
  }

  return {
    accessToken,
    refreshToken,
    currentUser,
    isInitialized,
    initializationError,
    isAuthenticated,
    setSession,
    clearSession,
    initialize,
    login,
  }
})
