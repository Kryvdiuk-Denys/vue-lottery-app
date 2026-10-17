<script setup lang="ts">
import { computed } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { AppButton, AppInput } from '@/shared/ui'
import type { CreateUserDto, User } from '@/entities/user'

interface UserFormValues {
  firstName: string
  lastName: string
  email: string
  username: string
  password: string
  age: number
  gender: string
  phone: string
}

const props = withDefaults(
  defineProps<{
    initialValues?: Partial<User>
    mode?: 'create' | 'edit'
    submitLabel?: string
  }>(),
  { initialValues: () => ({}), mode: 'create', submitLabel: 'Create user' },
)

const emit = defineEmits<{
  submit: [values: CreateUserDto]
  cancel: []
}>()

const validationSchema = computed(() =>
  yup.object({
    firstName: yup.string().trim().required('Вкажіть ім’я.'),
    lastName: yup.string().trim().required('Вкажіть прізвище.'),
    email: yup.string().trim().email('Введіть коректний email.').required('Вкажіть email.'),
    username: yup.string().trim().required('Вкажіть username.'),
    password:
      props.mode === 'create'
        ? yup.string().min(6, 'Пароль має містити щонайменше 6 символів.').required('Вкажіть пароль.')
        : yup.string().test('password-length', 'Пароль має містити щонайменше 6 символів.', (value) =>
            !value || value.length >= 6,
          ),
    age: yup.number().typeError('Вкажіть вік.').integer('Вік має бути цілим числом.').min(1).max(120).required(),
    gender: yup.string().required('Оберіть стать.'),
    phone: yup.string().trim().required('Вкажіть номер телефону.'),
  }),
)

const { defineField, errors, handleSubmit } = useForm<UserFormValues>({
  validationSchema,
  initialValues: {
    firstName: props.initialValues.firstName ?? '',
    lastName: props.initialValues.lastName ?? '',
    email: props.initialValues.email ?? '',
    username: props.initialValues.username ?? '',
    password: '',
    age: props.initialValues.age ?? 18,
    gender: props.initialValues.gender ?? '',
    phone: props.initialValues.phone ?? '',
  },
})

const [firstName, firstNameAttrs] = defineField('firstName')
const [lastName, lastNameAttrs] = defineField('lastName')
const [email, emailAttrs] = defineField('email')
const [username, usernameAttrs] = defineField('username')
const [password, passwordAttrs] = defineField('password')
const [age, ageAttrs] = defineField('age')
const [gender, genderAttrs] = defineField('gender')
const [phone, phoneAttrs] = defineField('phone')

const submit = handleSubmit((values) => {
  const payload: CreateUserDto = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    username: values.username.trim(),
    password: values.password,
    age: Number(values.age),
    gender: values.gender,
    phone: values.phone.trim(),
  }
  emit('submit', payload)
})
</script>

<template>
  <form class="user-form" novalidate @submit.prevent="submit">
    <div class="user-form-grid">
      <div>
        <AppInput v-model="firstName" v-bind="firstNameAttrs" label="First name" autocomplete="given-name" :error="errors.firstName" />
      </div>
      <div>
        <AppInput v-model="lastName" v-bind="lastNameAttrs" label="Last name" autocomplete="family-name" :error="errors.lastName" />
      </div>
      <div>
        <AppInput v-model="email" v-bind="emailAttrs" label="Email" type="email" autocomplete="email" :error="errors.email" />
      </div>
      <div>
        <AppInput v-model="username" v-bind="usernameAttrs" label="Username" autocomplete="username" :error="errors.username" />
      </div>
      <div>
        <AppInput
          v-model="password"
          v-bind="passwordAttrs"
          :label="`Password${mode === 'edit' ? ' (leave blank to keep current)' : ''}`"
          type="password"
          autocomplete="new-password"
          :error="errors.password"
        />
      </div>
      <div>
        <AppInput v-model.number="age" v-bind="ageAttrs" label="Age" type="number" min="1" max="120" :error="errors.age" />
      </div>
      <label>
        <span>Gender</span>
        <select v-model="gender" v-bind="genderAttrs">
          <option value="" disabled>Select gender</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
        </select>
        <small v-if="errors.gender" class="field-error">{{ errors.gender }}</small>
      </label>
      <div>
        <AppInput v-model="phone" v-bind="phoneAttrs" label="Phone" type="tel" autocomplete="tel" :error="errors.phone" />
      </div>
    </div>

    <div class="form-buttons">
      <AppButton v-if="mode === 'edit'" severity="secondary" outlined type="button" @click="emit('cancel')">
        Cancel
      </AppButton>
      <AppButton type="submit">{{ submitLabel }}</AppButton>
    </div>
  </form>
</template>

<style scoped>
.user-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.user-form-grid > label,
.user-form-grid > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: #41515c;
  font-size: 13px;
  font-weight: 600;
}

.user-form-grid input,
.user-form-grid select {
  width: 100%;
  min-height: 40px;
  border: 1px solid #dce5e8;
  border-radius: 7px;
  background: #fff;
  padding: 8px 10px;
  color: #26343c;
}

.user-form-grid input:focus,
.user-form-grid select:focus {
  border-color: #0aafc8;
  outline: 3px solid #0aafc81c;
}

.user-form-grid small {
  color: #c03939;
  font-size: 11px;
  font-weight: 400;
}

.field-error {
  color: #c03939;
  font-size: 11px;
  font-weight: 400;
}

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 580px) {
  .user-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
