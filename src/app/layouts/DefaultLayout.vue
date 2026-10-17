<script setup lang="ts">
import { AppHeader } from '@/widgets/app-header'
</script>

<template>
  <div class="default-layout">
    <AppHeader />
    <RouterView />
  </div>
</template>

<style scoped>
.default-layout {
  min-height: 100vh;
}
</style>
