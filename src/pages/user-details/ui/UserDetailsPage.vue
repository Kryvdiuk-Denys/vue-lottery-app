<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUsersStore, type User } from '@/entities/user'
import { notifyToast } from '@/shared/ui'

const props = defineProps<{ id: string }>()
const store = useUsersStore()
const user = ref<User | null>(null)
const isLoading = ref(false)
const error = ref('')

watch(
  () => props.id,
  async (value) => {
    isLoading.value = true
    error.value = ''
    try {
      user.value = await store.fetchUser(Number(value))
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Не вдалося завантажити користувача.'
      notifyToast({ severity: 'error', summary: 'Помилка', detail: error.value })
      user.value = null
    } finally {
      isLoading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <p v-if="isLoading" class="status-message" role="status">Завантаження профілю…</p>
  <p v-else-if="error" class="error-message" role="alert">{{ error }}</p>
  <div v-else-if="user" class="user-details">
    <div class="profile-heading">
      <img v-if="user.image" :src="user.image" :alt="`${user.firstName} ${user.lastName}`" />
      <div>
        <p class="eyebrow">USER #{{ user.id }}</p>
        <h1>{{ user.firstName }} {{ user.maidenName }} {{ user.lastName }}</h1>
        <p>{{ user.company?.title }}<span v-if="user.company?.name"> · {{ user.company.name }}</span></p>
      </div>
    </div>
    <dl class="detail-grid">
      <div><dt>Email</dt><dd><a :href="`mailto:${user.email}`">{{ user.email }}</a></dd></div>
      <div><dt>Username</dt><dd>{{ user.username }}</dd></div>
      <div><dt>Phone</dt><dd>{{ user.phone }}</dd></div>
      <div><dt>Age / gender</dt><dd>{{ user.age }} / {{ user.gender }}</dd></div>
      <div><dt>Birth date</dt><dd>{{ user.birthDate ?? '—' }}</dd></div>
      <div>
        <dt>Address</dt>
        <dd>
          {{ [user.address?.address, user.address?.city, user.address?.state, user.address?.country]
            .filter(Boolean).join(', ') || '—' }}
        </dd>
      </div>
      <div><dt>Department</dt><dd>{{ user.company?.department ?? '—' }}</dd></div>
    </dl>
    <RouterLink class="button-link" :to="{ name: 'user-edit', params: { id: user.id } }">Редагувати профіль</RouterLink>
  </div>
</template>

<style scoped>
.profile-heading {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
}

.profile-heading img {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: #e8f8fa;
  object-fit: cover;
}

.profile-heading h1 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
}

.profile-heading p:not(.eyebrow) {
  margin: 0;
  color: #718087;
  font-size: 13px;
}

.eyebrow {
  margin: 0 0 4px;
  color: #0aafc8;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 22px;
  margin: 20px 0;
}

.detail-grid > div {
  border-bottom: 1px solid #edf1f2;
  padding: 12px 0;
}

.detail-grid dt {
  color: #7a878e;
  font-size: 11px;
  text-transform: uppercase;
}

.detail-grid dd {
  margin: 4px 0 0;
  color: #293941;
  font-size: 13px;
}

.detail-grid a {
  color: #168698;
}

.status-message,
.error-message {
  padding: 20px 0;
  color: #68777e;
}

.error-message {
  color: #b52e2e;
}

.button-link {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  border-radius: 7px;
  background: #0aafc8;
  padding: 8px 14px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}

@media (max-width: 580px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
