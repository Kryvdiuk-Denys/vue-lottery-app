import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { clearAuthStorage, getStoredAccessToken, getStoredUser, saveAuthSession } from '../api/auth-storage'
import { ServiceProvider } from '../services/service-provider'
import type { AuthTokens, LoginCredentials, User } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(getStoredUser())
  const accessToken = ref<string | null>(getStoredAccessToken())
  const isInitialized = ref(false)
  const isAuthenticated = computed(() => Boolean(accessToken.value && currentUser.value))
  const initializationError = ref('')

  if (typeof window !== 'undefined') {
    window.addEventListener('auth:tokens-refreshed', (event) => {
      const tokens = (event as CustomEvent<AuthTokens>).detail
      accessToken.value = tokens.accessToken
    })

    window.addEventListener('auth:expired', () => {
      accessToken.value = null
      currentUser.value = null
    })
  }

  async function initialize(): Promise<void> {
    if (isInitialized.value) return

    if (!accessToken.value) {
      currentUser.value = null
      isInitialized.value = true
      return
    }

    try {
      currentUser.value = await ServiceProvider.auth.me()
    } catch (error) {
      clearAuthStorage()
      accessToken.value = null
      currentUser.value = null
      initializationError.value =
        error instanceof Error ? error.message : 'Не вдалося перевірити авторизацію.'
    } finally {
      isInitialized.value = true
    }
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    const response = await ServiceProvider.auth.login(credentials)
    const { accessToken: nextAccessToken, refreshToken, ...user } = response
    saveAuthSession(user, { accessToken: nextAccessToken, refreshToken })
    accessToken.value = nextAccessToken
    currentUser.value = user
    initializationError.value = ''
  }

  function logout(): void {
    clearAuthStorage()
    accessToken.value = null
    currentUser.value = null
  }

  return {
    accessToken,
    currentUser,
    isInitialized,
    isAuthenticated,
    initializationError,
    initialize,
    login,
    logout,
  }
})
