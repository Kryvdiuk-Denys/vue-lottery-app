<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/entities/session'
import { AppButton } from '@/shared/ui'

const router = useRouter()
const session = useSessionStore()

async function logout(): Promise<void> {
  session.clearSession()
  await router.replace({ name: 'login' })
}
</script>

<template>
  <AppButton severity="secondary" outlined @click="logout">Logout</AppButton>
</template>
