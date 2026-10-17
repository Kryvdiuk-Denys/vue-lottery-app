<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSessionStore } from '@/entities/session'
import { useThemeStore } from '@/entities/theme'
import { LogoutButton } from '@/features/auth'
import { AppButton } from '@/shared/ui'

const session = useSessionStore()
const { isAuthenticated } = storeToRefs(session)
const theme = useThemeStore()
</script>

<template>
  <nav class="main-navigation" aria-label="Main navigation">
    <RouterLink :to="{ name: 'home' }">Home</RouterLink>
    <RouterLink :to="{ name: 'about' }">About author</RouterLink>
    <RouterLink :to="{ name: 'users' }">Users</RouterLink>
    <RouterLink v-if="!isAuthenticated" :to="{ name: 'login' }">Login</RouterLink>
    <LogoutButton v-else />
    <AppButton severity="secondary" outlined :aria-label="`Switch to ${theme.isDark ? 'light' : 'dark'} theme`" @click="theme.toggleTheme()">
      <i :class="theme.isDark ? 'pi pi-sun' : 'pi pi-moon'" aria-hidden="true" />
      <span class="theme-label">{{ theme.isDark ? 'Світла' : 'Темна' }}</span>
    </AppButton>
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

.theme-label {
  margin-left: 6px;
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
