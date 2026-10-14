<script setup lang="ts">
import Logo from '../components/Logo.vue'
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
