<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const error = ref(auth.initializationError)
const isLoading = ref(false)

const { defineField, errors, handleSubmit } = useForm({
  validationSchema: yup.object({
    username: yup.string().trim().required('Вкажіть username.'),
    password: yup.string().required('Вкажіть пароль.'),
  }),
  initialValues: { username: '', password: '' },
})
const [username, usernameAttrs] = defineField('username')
const [password, passwordAttrs] = defineField('password')

const submit = handleSubmit(async (values) => {
  error.value = ''
  isLoading.value = true
  try {
    await auth.login({ username: values.username.trim(), password: values.password })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/users'
    await router.replace(redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/users')
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Не вдалося увійти. Спробуйте ще раз.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="login-card">
    <p class="eyebrow">SECURE ACCESS</p>
    <h1>Увійти до системи</h1>
    <p class="login-description">Авторизуйтеся, щоб переглядати та редагувати користувачів.</p>

    <div v-if="error" class="error-message" role="alert">{{ error }}</div>
    <form class="login-form" @submit.prevent="submit">
      <label for="username">Username</label>
      <input id="username" v-model="username" v-bind="usernameAttrs" autocomplete="username" />
      <small v-if="errors.username">{{ errors.username }}</small>
      <label for="password">Password</label>
      <input id="password" v-model="password" v-bind="passwordAttrs" type="password" autocomplete="current-password" />
      <small v-if="errors.password">{{ errors.password }}</small>
      <button class="button" type="submit" :disabled="isLoading">
        {{ isLoading ? 'Вхід…' : 'Login' }}
      </button>
    </form>
    <p class="test-account">Тестовий обліковий запис: <code>emilys / emilyspass</code></p>
  </section>
</template>

<style scoped>
.login-card {
  width: min(100%, 420px);
  border: 1px solid #e5edef;
  border-radius: 14px;
  background: #fff;
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

.login-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
}

.login-form label {
  margin-top: 6px;
  color: #41515c;
  font-size: 13px;
  font-weight: 600;
}

.login-form small {
  color: #c03939;
  font-size: 11px;
}

.login-form input {
  min-height: 42px;
  border: 1px solid #dce5e8;
  border-radius: 7px;
  padding: 9px 11px;
}

.login-form input:focus {
  border-color: #0aafc8;
  outline: 3px solid #0aafc81c;
}

.button {
  min-height: 42px;
  margin-top: 10px;
  border: 0;
  border-radius: 7px;
  background: #0aafc8;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.error-message {
  margin-top: 16px;
  border-radius: 7px;
  background: #fff0f0;
  padding: 10px 12px;
  color: #b52e2e;
  font-size: 13px;
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
