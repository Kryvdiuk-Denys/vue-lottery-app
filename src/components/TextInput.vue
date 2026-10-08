<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label?: string
    type?: 'text' | 'email' | 'tel' | 'date'
    placeholder?: string
    required?: boolean
    error?: string
    modelValue?: string
  }>(),
  {
    label: '',
    type: 'text',
    placeholder: '',
    required: false,
    error: '',
    modelValue: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const value = computed({
  get: () => props.modelValue,
  set: (newValue: string) => emit('update:modelValue', newValue),
})
</script>

<template>
  <div class="mb-3">
    <label v-if="label" class="form-label">{{ label }}</label>
    <input
      v-model="value"
      :type="type"
      class="form-control"
      :class="{ 'is-invalid': !!error }"
      :placeholder="placeholder"
      :required="required"
    />
    <div v-if="error" class="invalid-feedback d-block">{{ error }}</div>
  </div>
</template>
