<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { UserForm } from '@/features/user-form'
import { useUsersStore, type CreateUserDto, type User } from '@/entities/user'
import { AppButton, AppConfirmDialog, AppInput, notifyToast } from '@/shared/ui'
import { UsersTable } from '@/widgets/users-table'

const LIMIT = 10
const route = useRoute()
const router = useRouter()
const store = useUsersStore()
const { users, total, isLoading, error } = storeToRefs(store)
const { fetchUsers, createUser, removeUser } = store
const searchInput = ref(typeof route.query.q === 'string' ? route.query.q : '')
const showCreateForm = ref(false)
const mutationError = ref('')
const pendingDelete = ref<User | null>(null)
const isConfirmOpen = ref(false)
const page = computed(() => {
  const parsed = Number(route.query.page ?? 1)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
})
const query = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / LIMIT)))

let searchTimeout = 0
onBeforeUnmount(() => window.clearTimeout(searchTimeout))

watch(
  () => [route.query.page, route.query.q],
  async () => {
    searchInput.value = query.value
    await fetchUsers({ limit: LIMIT, skip: (page.value - 1) * LIMIT, q: query.value })
    const rawPage = typeof route.query.page === 'string' ? Number(route.query.page) : 1
    if (!error.value && (!Number.isInteger(rawPage) || rawPage < 1 || rawPage > totalPages.value)) {
      await router.replace({
        name: 'users',
        query: {
          ...(query.value ? { q: query.value } : {}),
          ...(totalPages.value > 1 ? { page: String(totalPages.value) } : {}),
        },
      })
    }
  },
  { immediate: true },
)

watch(searchInput, (value) => {
  window.clearTimeout(searchTimeout)
  if (value.trim() === query.value) return
  searchTimeout = window.setTimeout(() => {
    const nextQuery = value.trim()
    void router.replace({ name: 'users', query: nextQuery ? { q: nextQuery } : {} })
  }, 300)
})

function changePage(nextPage: number): void {
  if (nextPage < 1 || nextPage > totalPages.value) return
  void router.push({
    name: 'users',
    query: {
      ...(query.value ? { q: query.value } : {}),
      ...(nextPage > 1 ? { page: String(nextPage) } : {}),
    },
  })
}

async function submitCreate(values: CreateUserDto): Promise<void> {
  mutationError.value = ''
  try {
    await createUser(values)
    showCreateForm.value = false
    notifyToast({ severity: 'success', summary: 'Користувача створено', detail: 'Новий користувач доданий до списку.' })
    await router.replace({ name: 'users' })
  } catch (cause) {
    mutationError.value = cause instanceof Error ? cause.message : 'Не вдалося створити користувача.'
    notifyToast({ severity: 'error', summary: 'Помилка', detail: mutationError.value })
  }
}

function confirmDelete(user: User): void {
  pendingDelete.value = user
  isConfirmOpen.value = true
}

async function deleteUser(): Promise<void> {
  if (!pendingDelete.value) return
  const user = pendingDelete.value
  mutationError.value = ''
  try {
    await removeUser(user.id)
    isConfirmOpen.value = false
    pendingDelete.value = null
    notifyToast({ severity: 'success', summary: 'Користувача видалено', detail: `${user.firstName} ${user.lastName}` })
    if (users.value.length === 0 && page.value > 1) changePage(page.value - 1)
  } catch (cause) {
    mutationError.value = cause instanceof Error ? cause.message : 'Не вдалося видалити користувача.'
    notifyToast({ severity: 'error', summary: 'Помилка', detail: mutationError.value })
  }
}
</script>

<template>
  <section class="content-card users-card">
    <div class="users-toolbar">
      <AppInput
        v-model="searchInput"
        class="search-field"
        type="search"
        placeholder="Пошук за ім’ям або username"
        aria-label="Пошук користувачів"
      />
      <AppButton @click="showCreateForm = !showCreateForm">
        {{ showCreateForm ? 'Закрити форму' : '+ Додати користувача' }}
      </AppButton>
    </div>

    <div v-if="showCreateForm" class="create-panel">
      <h2>Новий користувач</h2>
      <UserForm @submit="submitCreate" />
    </div>
    <p v-if="mutationError" class="error-message" role="alert">{{ mutationError }}</p>
    <p v-if="isLoading" class="status-message" role="status">Завантаження користувачів…</p>
    <p v-else-if="error" class="error-message" role="alert">{{ error }}</p>
    <p v-else-if="!users.length" class="status-message">Користувачів не знайдено.</p>
    <div v-else class="table-wrap">
      <UsersTable
        :users="users"
        :loading="isLoading"
        @edit="(user) => router.push({ name: 'user-edit', params: { id: user.id } })"
        @remove="confirmDelete"
      />
    </div>

    <footer class="pagination">
      <span>{{ total }} користувачів · сторінка {{ page }} з {{ totalPages }}</span>
      <div>
        <AppButton severity="secondary" outlined :disabled="page <= 1 || isLoading" @click="changePage(page - 1)">
          ← Назад
        </AppButton>
        <AppButton
          severity="secondary"
          outlined
          :disabled="page >= totalPages || isLoading"
          @click="changePage(page + 1)"
        >
          Далі →
        </AppButton>
      </div>
    </footer>

    <AppConfirmDialog
      v-model="isConfirmOpen"
      title="Видалити користувача?"
      :message="pendingDelete ? `${pendingDelete.firstName} ${pendingDelete.lastName} (${pendingDelete.email})` : ''"
      confirm-label="Видалити"
      @cancel="isConfirmOpen = false"
      @confirm="deleteUser"
    />
  </section>
</template>

<style scoped>
.users-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.search-field {
  flex: 1;
}

.create-panel {
  margin-bottom: 20px;
  border: 1px solid #e5edef;
  border-radius: 10px;
  background: #fbfdfd;
  padding: 18px;
}

.create-panel h2 {
  margin: 0 0 14px;
  font-size: 17px;
  font-weight: 700;
}

.table-wrap {
  overflow-x: auto;
}

.pagination,
.pagination > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.pagination {
  margin-top: 18px;
  color: #738087;
  font-size: 12px;
}

.status-message {
  padding: 26px 0;
  color: #68777e;
  text-align: center;
}

.error-message {
  border-radius: 7px;
  background: #fff0f0;
  padding: 11px;
  color: #b52e2e;
  font-size: 13px;
}

@media (max-width: 620px) {
  .users-toolbar {
    flex-direction: column;
  }

  .pagination {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
