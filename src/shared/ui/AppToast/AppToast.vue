<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import type { ToastMessageOptions } from 'primevue/toast'

const toast = useToast()
const handleToast = (event: Event) => toast.add((event as CustomEvent<ToastMessageOptions>).detail)

onMounted(() => window.addEventListener('app:toast', handleToast))
onBeforeUnmount(() => window.removeEventListener('app:toast', handleToast))
</script>

<template>
  <Toast position="top-right" />
</template>
