<script setup lang="ts">
import AppNavigation from './AppNavigation.vue'
import Logo from './Logo.vue'
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <Logo />
      <AppNavigation />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  border-bottom: 1px solid #e9eef0;
  background: rgba(255, 255, 255, 0.95);
}

.header-inner {
  display: flex;
  width: min(1120px, calc(100% - 40px));
  min-height: 72px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 0 auto;
}

@media (max-width: 620px) {
  .header-inner {
    width: calc(100% - 24px);
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    padding: 12px 0;
  }
}
</style>
