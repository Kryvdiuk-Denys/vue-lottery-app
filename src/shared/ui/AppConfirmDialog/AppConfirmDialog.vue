<script setup lang="ts">
import Dialog from 'primevue/dialog'
import AppButton from '../AppButton/AppButton.vue'

defineProps<{
  modelValue: boolean
  title: string
  message: string
  confirmLabel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [visible: boolean]
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Dialog
    :visible="modelValue"
    :header="title"
    modal
    :style="{ width: 'min(28rem, calc(100vw - 2rem))' }"
    @update:visible="emit('update:modelValue', $event)"
  >
    <p>{{ message }}</p>
    <template #footer>
      <AppButton severity="secondary" outlined @click="emit('cancel')">Скасувати</AppButton>
      <AppButton severity="danger" @click="emit('confirm')">{{ confirmLabel ?? 'Підтвердити' }}</AppButton>
    </template>
  </Dialog>
</template>
