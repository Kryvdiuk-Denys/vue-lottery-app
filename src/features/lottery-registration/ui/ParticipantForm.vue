<script setup lang="ts">
import { reactive, watch } from 'vue'
import { AppButton, AppInput } from '@/shared/ui'
import type { ParticipantFormValues } from '@/entities/lottery'

const props = withDefaults(
  defineProps<{
    initialValues?: Partial<ParticipantFormValues>
    submitLabel?: string
    customErrors?: Partial<Record<keyof ParticipantFormValues, string>>
    showCancel?: boolean
  }>(),
  {
    initialValues: () => ({}),
    submitLabel: 'Save',
    customErrors: () => ({}),
    showCancel: false,
  },
)

const emit = defineEmits<{
  submit: [values: ParticipantFormValues]
  cancel: []
}>()

const emptyValues: ParticipantFormValues = {
  name: '',
  email: '',
  phone: '',
  dateOfBirth: '',
}

const form = reactive<ParticipantFormValues>({ ...emptyValues })
const errors = reactive<Record<keyof ParticipantFormValues, string>>({
  name: '',
  email: '',
  phone: '',
  dateOfBirth: '',
})

const applyValues = (values: Partial<ParticipantFormValues> = {}) => {
  Object.assign(form, emptyValues, values)
  for (const key of Object.keys(errors) as Array<keyof ParticipantFormValues>) {
    errors[key] = ''
  }
}

watch(
  () => props.initialValues,
  (newValues) => {
    applyValues(newValues)
  },
  { immediate: true },
)

const isFutureDate = (value: string) => {
  if (!value) return false
  const selectedDate = new Date(`${value}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return selectedDate > today
}

const validateForm = () => {
  const nextErrors: Record<keyof ParticipantFormValues, string> = {
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
  }

  if (!form.name.trim()) {
    nextErrors.name = 'Це поле є обов’язковим.'
  }

  if (!form.email.trim()) {
    nextErrors.email = 'Це поле є обов’язковим.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    nextErrors.email = 'Введіть коректну електронну пошту.'
  }

  if (!form.phone.trim()) {
    nextErrors.phone = 'Це поле є обов’язковим.'
  } else if (!/^\+380\d{9}$/.test(form.phone.trim())) {
    nextErrors.phone = 'Телефон повинен бути у форматі +380XXXXXXXXX.'
  }

  if (!form.dateOfBirth) {
    nextErrors.dateOfBirth = 'Це поле є обов’язковим.'
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth)) {
    nextErrors.dateOfBirth = 'Дата має бути у форматі yyyy-mm-dd.'
  } else if (isFutureDate(form.dateOfBirth)) {
    nextErrors.dateOfBirth = 'Дата народження не може бути у майбутньому.'
  }

  for (const key of Object.keys(nextErrors) as Array<keyof ParticipantFormValues>) {
    errors[key] = nextErrors[key]
  }

  return !Object.values(nextErrors).some(Boolean)
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }

  emit('submit', {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    dateOfBirth: form.dateOfBirth,
  })
}
</script>

<template>
  <form class="participant-form" @submit.prevent="handleSubmit">
    <div class="form-fields">
      <AppInput v-model="form.name" label="Name" placeholder="Enter user name" :error="errors.name" />
      <AppInput
        v-model="form.dateOfBirth"
        label="Date of Birth"
        type="date"
        placeholder="mm/dd/yyyy"
        :error="errors.dateOfBirth"
      />
      <AppInput
        v-model="form.email"
        label="Email"
        type="email"
        placeholder="Enter email"
        :error="errors.email || customErrors.email || ''"
      />
      <AppInput
        v-model="form.phone"
        label="Phone number"
        type="tel"
        placeholder="(___) ___-____"
        :error="errors.phone"
      />
    </div>

    <div class="form-actions">
      <AppButton v-if="showCancel" variant="secondary" type="button" @click="emit('cancel')">Cancel</AppButton>
      <AppButton type="submit">{{ submitLabel }}</AppButton>
    </div>
  </form>
</template>

<style scoped>
.participant-form {
  width: 100%;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.form-fields :deep(.mb-3) {
  margin-bottom: 0 !important;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 38px;
}
</style>
