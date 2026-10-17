<script setup lang="ts">
import Button from 'primevue/button'

withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'outline'
    severity?: 'primary' | 'secondary' | 'danger' | 'contrast'
    outlined?: boolean
    disabled?: boolean
    loading?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    severity: undefined,
    outlined: false,
    disabled: false,
    loading: false,
    type: 'button',
  },
)

const emit = defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <Button
    :severity="severity ?? (variant === 'outline' ? 'primary' : variant)"
    :outlined="outlined || variant === 'outline'"
    :disabled="disabled"
    :loading="loading"
    :type="type"
    @click="emit('click', $event)"
  >
    <slot />
  </Button>
</template>
