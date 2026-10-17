import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore(
  'theme',
  () => {
    const isDark = ref(false)
    const theme = computed(() => (isDark.value ? 'dark' : 'light'))

    function setTheme(nextTheme: 'light' | 'dark'): void {
      isDark.value = nextTheme === 'dark'
    }

    function toggleTheme(): void {
      isDark.value = !isDark.value
    }

    if (typeof document !== 'undefined') {
      watch(
        isDark,
        (dark) => document.documentElement.classList.toggle('app-dark', dark),
        { immediate: true },
      )
    }

    return { isDark, theme, setTheme, toggleTheme }
  },
  { persist: { key: 'vue-lottery-theme' } },
)
