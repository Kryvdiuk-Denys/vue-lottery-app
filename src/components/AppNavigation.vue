<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
</script>

<template>
  <nav class="main-navigation" aria-label="Main navigation">
    <RouterLink :to="{ name: 'home' }">Home</RouterLink>
    <RouterLink :to="{ name: 'about' }">About author</RouterLink>
    <RouterLink :to="{ name: 'users' }">Users</RouterLink>
    <RouterLink v-if="!auth.isAuthenticated" :to="{ name: 'login' }">Login</RouterLink>
    <button
      v-else
      type="button"
      class="navigation-link"
      @click="auth.logout(); $router.push({ name: 'login' })"
    >
      Logout
    </button>
  </nav>
</template>

<style scoped>
.main-navigation {
  display: flex;
  align-items: center;
  gap: 8px;
}

.main-navigation a,
.navigation-link {
  border: 0;
  border-radius: 7px;
  background: transparent;
  padding: 9px 11px;
  color: #5d6a74;
  font-size: 14px;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}

.main-navigation a:hover,
.navigation-link:hover {
  background: #f0f8f9;
  color: #087f91;
}

.main-navigation a.router-link-active {
  background: #e8f8fa;
  color: #087f91;
  font-weight: 700;
}

.navigation-link {
  cursor: pointer;
}

@media (max-width: 620px) {
  .main-navigation {
    flex-wrap: wrap;
    justify-content: center;
    gap: 2px;
  }

  .main-navigation a,
  .navigation-link {
    padding: 7px;
    font-size: 12px;
  }
}
</style>
