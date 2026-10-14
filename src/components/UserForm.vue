<script setup lang="ts">
import { computed } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import type { CreateUserDto, User } from '../types'

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
      <label>
        <span>First name</span>
        <input v-model="firstName" v-bind="firstNameAttrs" autocomplete="given-name" />
        <small v-if="errors.firstName">{{ errors.firstName }}</small>
      </label>
      <label>
        <span>Last name</span>
        <input v-model="lastName" v-bind="lastNameAttrs" autocomplete="family-name" />
        <small v-if="errors.lastName">{{ errors.lastName }}</small>
      </label>
      <label>
        <span>Email</span>
        <input v-model="email" v-bind="emailAttrs" type="email" autocomplete="email" />
        <small v-if="errors.email">{{ errors.email }}</small>
      </label>
      <label>
        <span>Username</span>
        <input v-model="username" v-bind="usernameAttrs" autocomplete="username" />
        <small v-if="errors.username">{{ errors.username }}</small>
      </label>
      <label>
        <span>Password{{ mode === 'edit' ? ' (leave blank to keep current)' : '' }}</span>
        <input
          v-model="password"
          v-bind="passwordAttrs"
          type="password"
          :autocomplete="mode === 'edit' ? 'new-password' : 'new-password'"
        />
        <small v-if="errors.password">{{ errors.password }}</small>
      </label>
      <label>
        <span>Age</span>
        <input v-model.number="age" v-bind="ageAttrs" type="number" min="1" max="120" />
        <small v-if="errors.age">{{ errors.age }}</small>
      </label>
      <label>
        <span>Gender</span>
        <select v-model="gender" v-bind="genderAttrs">
          <option value="" disabled>Select gender</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
        </select>
        <small v-if="errors.gender">{{ errors.gender }}</small>
      </label>
      <label>
        <span>Phone</span>
        <input v-model="phone" v-bind="phoneAttrs" type="tel" autocomplete="tel" />
        <small v-if="errors.phone">{{ errors.phone }}</small>
      </label>
    </div>

    <div class="form-buttons">
      <button v-if="mode === 'edit'" class="button button-secondary" type="button" @click="emit('cancel')">
        Cancel
      </button>
      <button class="button" type="submit">{{ submitLabel }}</button>
    </div>
  </form>
</template>

<style scoped>
.user-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.user-form-grid label {
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

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.button {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 7px;
  background: #0aafc8;
  padding: 8px 15px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.button:hover {
  background: #078fa4;
  color: #fff;
}

.button-secondary {
  background: #e9eff1;
  color: #43525b;
}

.button-secondary:hover {
  background: #dce5e8;
  color: #26343c;
}

@media (max-width: 580px) {
  .user-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
