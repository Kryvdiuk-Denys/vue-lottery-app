<script setup lang="ts">
import { Logo } from '@/widgets/app-header'
</script>

<template>
  <main class="auth-layout">
    <Logo />
    <RouterView />
  </main>
</template>

<style scoped>
.auth-layout {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 26px;
  padding: 24px;
}
</style>
