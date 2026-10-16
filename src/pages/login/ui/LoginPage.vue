<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LoginForm } from '@/features/auth'
import { useSessionStore } from '@/entities/session'
import type { LoginCredentials } from '@/entities/session'
import { notifyToast } from '@/shared/ui'

const session = useSessionStore()
const route = useRoute()
const router = useRouter()
const error = ref(session.initializationError)
const isLoading = ref(false)

async function login(credentials: LoginCredentials): Promise<void> {
  error.value = ''
  isLoading.value = true
  try {
    await session.login(credentials)
    notifyToast({ severity: 'success', summary: 'Вхід виконано', detail: 'Ви успішно увійшли в систему.' })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/users'
    await router.replace(redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/users')
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Не вдалося увійти. Спробуйте ще раз.'
    notifyToast({ severity: 'error', summary: 'Помилка авторизації', detail: error.value })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section class="login-card">
    <p class="eyebrow">SECURE ACCESS</p>
    <h1>Увійти до системи</h1>
    <p class="login-description">Авторизуйтеся, щоб переглядати та редагувати користувачів.</p>
    <LoginForm :error="error" :loading="isLoading" @submit="login" />
    <p class="test-account">Тестовий обліковий запис: <code>emilys / emilyspass</code></p>
  </section>
</template>

<style scoped>
.login-card {
  width: min(100%, 420px);
  border: 1px solid #e5edef;
  border-radius: 14px;
  background: var(--surface-card, #fff);
  padding: 30px;
  box-shadow: 0 18px 55px #23424c0d;
}

.eyebrow {
  margin: 0 0 8px;
  color: #0aafc8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

h1 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
}

.login-description,
.test-account {
  color: #718087;
  font-size: 13px;
  line-height: 1.5;
}

.test-account {
  margin: 18px 0 0;
  font-size: 11px;
}

@media (max-width: 480px) {
  .login-card {
    padding: 22px;
  }
}
</style>
