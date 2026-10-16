<script setup lang="ts">
defineProps<{ id: string }>()
</script>

<template>
  <section class="content-card profile-card">
    <RouterLink class="back-link" :to="{ name: 'users' }">← До списку користувачів</RouterLink>
    <RouterView :key="id" />
  </section>
</template>
