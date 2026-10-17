<script setup lang="ts">
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { AppButton, AppInput } from '@/shared/ui'
import type { LoginCredentials } from '@/entities/session'

defineProps<{
  error?: string
  loading?: boolean
}>()

const emit = defineEmits<{ submit: [credentials: LoginCredentials] }>()

const { defineField, errors, handleSubmit } = useForm<LoginCredentials>({
  validationSchema: yup.object({
    username: yup.string().trim().required('Вкажіть username.'),
    password: yup.string().required('Вкажіть пароль.'),
  }),
  initialValues: { username: '', password: '' },
})
const [username, usernameAttrs] = defineField('username')
const [password, passwordAttrs] = defineField('password')

const submit = handleSubmit((values) =>
  emit('submit', { username: values.username.trim(), password: values.password }),
)
</script>

<template>
  <form class="login-form" novalidate @submit.prevent="submit">
    <AppInput
      v-model="username"
      v-bind="usernameAttrs"
      label="Username"
      autocomplete="username"
      :error="errors.username"
    />
    <AppInput
      v-model="password"
      v-bind="passwordAttrs"
      label="Password"
      type="password"
      autocomplete="current-password"
      :error="errors.password"
    />
    <p v-if="error" class="error-message" role="alert">{{ error }}</p>
    <AppButton type="submit" :loading="loading" class="login-submit">
      {{ loading ? 'Вхід…' : 'Login' }}
    </AppButton>
  </form>
</template>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 20px;
}

.error-message {
  margin: 0;
  border-radius: 7px;
  background: #fff0f0;
  padding: 10px 12px;
  color: #b52e2e;
  font-size: 13px;
}

.login-submit {
  align-self: stretch;
}
</style>
