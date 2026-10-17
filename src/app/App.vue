<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from './layouts/DefaultLayout.vue'
import AuthLayout from './layouts/AuthLayout.vue'
import { AppToast } from '@/shared/ui'
import { useThemeStore } from '@/entities/theme'

const route = useRoute()
const layout = computed(() => (route.meta.layout === 'auth' ? AuthLayout : DefaultLayout))
useThemeStore()
</script>

<template>
  <component :is="layout" />
  <AppToast />
</template>
