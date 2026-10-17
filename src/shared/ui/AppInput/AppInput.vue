<script setup lang="ts">
import { useAttrs } from 'vue'
import InputText from 'primevue/inputtext'

defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    modelValue?: string | number | null
    label?: string
    error?: string
    type?: string
    placeholder?: string
    id?: string
  }>(),
  { modelValue: '', label: '', error: '', type: 'text', placeholder: '', id: undefined },
)

const emit = defineEmits<{ 'update:modelValue': [value: string | number | null] }>()
const attrs = useAttrs()
</script>

<template>
  <label class="app-input">
    <span v-if="label" class="app-input-label">{{ label }}</span>
    <InputText
      v-bind="attrs"
      :id="id"
      :model-value="modelValue == null ? null : String(modelValue)"
      :type="type"
      :placeholder="placeholder"
      :invalid="Boolean(error)"
      @update:model-value="emit('update:modelValue', $event ?? '')"
    />
    <small v-if="error" class="app-input-error" role="alert">{{ error }}</small>
  </label>
</template>

<style scoped>
.app-input {
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: #41515c;
  font-size: 13px;
  font-weight: 600;
}

.app-input :deep(.p-inputtext) {
  width: 100%;
  min-height: 40px;
}

.app-input-error {
  color: #b52e2e;
  font-size: 11px;
  font-weight: 400;
}
</style>
