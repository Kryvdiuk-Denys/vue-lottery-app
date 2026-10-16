<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    size?: 'sm' | 'lg' | 'xl'
  }>(),
  {
    title: 'Dialog',
    size: 'lg',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

let escapeHandler: ((event: KeyboardEvent) => void) | null = null

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      if (escapeHandler) {
        window.removeEventListener('keydown', escapeHandler)
        escapeHandler = null
      }
      return
    }

    if (escapeHandler) {
      window.removeEventListener('keydown', escapeHandler)
    }

    escapeHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        visible.value = false
        emit('close')
      }
    }

    window.addEventListener('keydown', escapeHandler)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (escapeHandler) {
    window.removeEventListener('keydown', escapeHandler)
  }
})

const closeDialog = () => {
  visible.value = false
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal fade show d-block" tabindex="-1" aria-modal="true" role="dialog">
      <div class="modal-backdrop fade show" @click="closeDialog" />
      <div class="modal-dialog modal-dialog-centered" :class="`modal-${size}`">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h5 class="modal-title">{{ title }}</h5>
            <button type="button" class="btn-close" aria-label="Close" @click="closeDialog" />
          </div>
          <div class="modal-body">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal {
  z-index: 1055;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1045;
}

.modal-dialog {
  position: relative;
  z-index: 1060;
}
</style>
