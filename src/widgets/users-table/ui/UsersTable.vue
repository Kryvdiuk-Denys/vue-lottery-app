<script setup lang="ts">
import { AppButton, AppTable } from '@/shared/ui'
import type { User } from '@/entities/user'

defineProps<{
  users: User[]
  loading?: boolean
}>()

const emit = defineEmits<{
  edit: [user: User]
  remove: [user: User]
}>()

const columns = [
  { field: 'name', header: 'Користувач' },
  { field: 'username', header: 'Username' },
  { field: 'email', header: 'Email' },
  { field: 'phone', header: 'Телефон' },
  { field: 'age', header: 'Вік / стать' },
  { field: 'actions', header: 'Дії' },
]

function toUser(row: object): User {
  return row as User
}
</script>

<template>
  <AppTable :rows="users" :columns="columns" :loading="loading">
    <template #name="{ data }">
      <RouterLink class="user-name" :to="{ name: 'user-details', params: { id: toUser(data).id } }">
        {{ toUser(data).firstName }} {{ toUser(data).lastName }}
      </RouterLink>
    </template>
    <template #email="{ data }">
      <a :href="`mailto:${toUser(data).email}`">{{ toUser(data).email }}</a>
    </template>
    <template #age="{ data }">{{ toUser(data).age }} / {{ toUser(data).gender }}</template>
    <template #actions="{ data }">
      <div class="row-actions">
        <AppButton
          severity="secondary"
          outlined
          aria-label="Редагувати користувача"
          @click="emit('edit', toUser(data))"
        >
          <i class="pi pi-pencil" aria-hidden="true" />
        </AppButton>
        <AppButton
          severity="danger"
          outlined
          aria-label="Видалити користувача"
          @click="emit('remove', toUser(data))"
        >
          <i class="pi pi-trash" aria-hidden="true" />
        </AppButton>
      </div>
    </template>
  </AppTable>
</template>

<style scoped>
.user-name {
  color: #293941;
  font-weight: 700;
  text-decoration: none;
}

.user-name:hover,
a {
  color: #168698;
}

.row-actions {
  display: flex;
  gap: 6px;
}
</style>
