<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserForm from '../../components/UserForm.vue'
import { useUsersStore } from '../../stores/users'
import type { CreateUserDto, User } from '../../types'

const LIMIT = 10
const route = useRoute()
const router = useRouter()
const store = useUsersStore()
const searchInput = ref(typeof route.query.q === 'string' ? route.query.q : '')
const showCreateForm = ref(false)
const mutationError = ref('')
const pendingDelete = ref<User | null>(null)
const page = computed(() => {
  const parsed = Number(route.query.page ?? 1)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
})
const query = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))
const totalPages = computed(() => Math.max(1, Math.ceil(store.total / LIMIT)))

let searchTimeout = 0
onBeforeUnmount(() => window.clearTimeout(searchTimeout))

watch(
  () => [route.query.page, route.query.q],
  async () => {
    searchInput.value = query.value
    await store.loadPage({ page: page.value, limit: LIMIT, q: query.value })
    const rawPage = typeof route.query.page === 'string' ? Number(route.query.page) : 1
    if (!store.error && (!Number.isInteger(rawPage) || rawPage < 1 || rawPage > totalPages.value)) {
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
    void router.replace({
      name: 'users',
      query: nextQuery ? { q: nextQuery } : {},
    })
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

async function createUser(values: CreateUserDto): Promise<void> {
  mutationError.value = ''
  try {
    await store.createUser(values)
    showCreateForm.value = false
    await router.replace({ name: 'users' })
  } catch (cause) {
    mutationError.value = cause instanceof Error ? cause.message : 'Не вдалося створити користувача.'
  }
}

async function deleteUser(): Promise<void> {
  if (!pendingDelete.value) return
  mutationError.value = ''
  try {
    await store.deleteUser(pendingDelete.value.id)
    pendingDelete.value = null
    if (store.users.length === 0 && page.value > 1) changePage(page.value - 1)
  } catch (cause) {
    mutationError.value = cause instanceof Error ? cause.message : 'Не вдалося видалити користувача.'
  }
}
</script>

<template>
  <section class="content-card users-card">
    <div class="users-toolbar">
      <label class="search-field">
        <span class="visually-hidden">Пошук користувачів</span>
        <input v-model="searchInput" type="search" placeholder="Пошук за ім’ям або username" />
      </label>
      <button class="button" type="button" @click="showCreateForm = !showCreateForm">
        {{ showCreateForm ? 'Закрити форму' : '+ Додати користувача' }}
      </button>
    </div>

    <div v-if="showCreateForm" class="create-panel">
      <h2>Новий користувач</h2>
      <UserForm @submit="createUser" />
    </div>
    <p v-if="mutationError" class="error-message" role="alert">{{ mutationError }}</p>
    <p v-if="store.isLoading" class="status-message" role="status">Завантаження користувачів…</p>
    <p v-else-if="store.error" class="error-message" role="alert">{{ store.error }}</p>
    <p v-else-if="!store.users.length" class="status-message">Користувачів не знайдено.</p>

    <div v-else class="table-wrap">
      <table class="users-table">
        <thead>
          <tr>
            <th>Користувач</th>
            <th>Username</th>
            <th>Email</th>
            <th>Телефон</th>
            <th>Вік / стать</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in store.users" :key="user.id">
            <td>
              <RouterLink class="user-name" :to="{ name: 'user-details', params: { id: user.id } }">
                {{ user.firstName }} {{ user.lastName }}
              </RouterLink>
            </td>
            <td>{{ user.username }}</td>
            <td><a :href="`mailto:${user.email}`">{{ user.email }}</a></td>
            <td>{{ user.phone }}</td>
            <td>{{ user.age }} / {{ user.gender }}</td>
            <td class="row-actions">
              <RouterLink class="small-link" :to="{ name: 'user-edit', params: { id: user.id } }">Edit</RouterLink>
              <button class="delete-link" type="button" @click="pendingDelete = user">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="pagination">
      <span>{{ store.total }} користувачів · сторінка {{ page }} з {{ totalPages }}</span>
      <div>
        <button type="button" :disabled="page <= 1 || store.isLoading" @click="changePage(page - 1)">← Назад</button>
        <button type="button" :disabled="page >= totalPages || store.isLoading" @click="changePage(page + 1)">
          Далі →
        </button>
      </div>
    </footer>

    <div v-if="pendingDelete" class="dialog-backdrop" role="presentation" @click.self="pendingDelete = null">
      <section class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title">
        <h2 id="delete-title">Видалити користувача?</h2>
        <p>{{ pendingDelete.firstName }} {{ pendingDelete.lastName }} ({{ pendingDelete.email }})</p>
        <div class="dialog-actions">
          <button class="button button-secondary" type="button" @click="pendingDelete = null">Скасувати</button>
          <button class="button button-danger" type="button" @click="deleteUser">Видалити</button>
        </div>
      </section>
    </div>
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

.search-field input {
  width: 100%;
  min-height: 40px;
  border: 1px solid #dce5e8;
  border-radius: 7px;
  padding: 8px 11px;
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

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  text-align: left;
}

.users-table th,
.users-table td {
  border-bottom: 1px solid #edf1f2;
  padding: 12px 9px;
  white-space: nowrap;
}

.users-table th {
  color: #6e7b83;
  font-size: 11px;
  text-transform: uppercase;
}

.users-table a {
  color: #168698;
  text-decoration: none;
}

.users-table .user-name {
  color: #293941;
  font-weight: 700;
}

.row-actions {
  display: flex;
  gap: 10px;
}

.small-link,
.delete-link {
  border: 0;
  background: transparent;
  padding: 0;
  color: #168698;
  font-size: 12px;
  text-decoration: none;
  cursor: pointer;
}

.delete-link {
  color: #bd4343;
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

.pagination button {
  border: 1px solid #dce5e8;
  border-radius: 6px;
  background: #fff;
  padding: 7px 10px;
  color: #40515b;
}

.pagination button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
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

.button {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 7px;
  background: #0aafc8;
  padding: 8px 13px;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.button-secondary {
  background: #e9eff1;
  color: #43525b;
}

.button-danger {
  background: #ce4f4f;
}

.dialog-backdrop {
  position: fixed;
  z-index: 10;
  inset: 0;
  display: grid;
  place-items: center;
  background: #16242e88;
  padding: 18px;
}

.confirm-dialog {
  width: min(100%, 420px);
  border-radius: 12px;
  background: #fff;
  padding: 24px;
  box-shadow: 0 20px 70px #0003;
}

.confirm-dialog h2 {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 700;
}

.confirm-dialog p {
  color: #68777e;
  font-size: 13px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 20px;
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
