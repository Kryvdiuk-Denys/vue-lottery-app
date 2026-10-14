<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import UserForm from '../../components/UserForm.vue'
import { useUsersStore } from '../../stores/users'
import type { CreateUserDto, UpdateUserDto, User } from '../../types'

const props = defineProps<{ id: string }>()
const store = useUsersStore()
const router = useRouter()
const user = ref<User | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')

watch(
  () => props.id,
  async (value) => {
    isLoading.value = true
    error.value = ''
    try {
      user.value = await store.getUser(Number(value))
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Не вдалося завантажити користувача.'
    } finally {
      isLoading.value = false
    }
  },
  { immediate: true },
)

async function saveUser(values: CreateUserDto): Promise<void> {
  if (!user.value) return
  isSaving.value = true
  error.value = ''
  const data: UpdateUserDto = {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    username: values.username,
    age: values.age,
    gender: values.gender,
    phone: values.phone,
  }
  if (values.password) data.password = values.password

  try {
    await store.updateUser(user.value.id, data)
    await router.push({ name: 'users' })
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Не вдалося зберегти зміни.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div>
    <p v-if="isLoading" class="status-message" role="status">Завантаження даних…</p>
    <p v-else-if="error && !user" class="error-message" role="alert">{{ error }}</p>
    <template v-else-if="user">
      <h1 class="edit-title">Редагувати {{ user.firstName }} {{ user.lastName }}</h1>
      <p v-if="error" class="error-message" role="alert">{{ error }}</p>
      <p v-if="isSaving" class="status-message" role="status">Збереження…</p>
      <UserForm
        v-else
        mode="edit"
        submit-label="Зберегти зміни"
        :initial-values="user"
        @submit="saveUser"
        @cancel="router.push({ name: 'user-details', params: { id: user?.id } })"
      />
    </template>
  </div>
</template>

<style scoped>
.edit-title {
  margin: 22px 0 18px;
  font-size: 20px;
  font-weight: 700;
}

.status-message {
  padding: 20px 0;
  color: #68777e;
}

.error-message {
  color: #b52e2e;
  font-size: 13px;
}
</style>
