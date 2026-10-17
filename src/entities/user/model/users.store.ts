import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ServiceProvider } from '@/shared/api'
import { UserService } from '../api'
import type { CreateUserDto, UpdateUserDto, User } from './types'

interface FetchUsersOptions {
  limit?: number
  skip?: number
  q?: string
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const localOverrides = ref<Record<number, User>>({})
  const createdIds = ref<number[]>([])
  const deletedIds = ref<number[]>([])
  const hasUsers = computed(() => users.value.length > 0)
  let requestSequence = 0

  async function fetchUsers({ limit = 10, skip = 0, q = '' }: FetchUsersOptions = {}): Promise<void> {
    const requestId = ++requestSequence
    isLoading.value = true
    error.value = null
    try {
      const response = await ServiceProvider.get<UserService>('users').getPage({ limit, skip, q })
      if (requestId !== requestSequence) return

      const page = Math.floor(skip / limit) + 1
      const query = q.toLowerCase()
      const results = response.users
        .filter((user) => !deletedIds.value.includes(user.id))
        .map((user) => localOverrides.value[user.id] ?? user)
        .filter((user) => !createdIds.value.includes(user.id))
      const created = page === 1
        ? createdIds.value
            .map((id) => localOverrides.value[id])
            .filter(
              (user): user is User =>
                user !== undefined &&
                (!query ||
                  `${user.firstName} ${user.lastName} ${user.username} ${user.email} ${user.phone}`
                    .toLowerCase()
                    .includes(query)),
            )
        : []

      users.value = [...created, ...results].slice(0, limit)
      total.value = Math.max(
        0,
        response.total -
          deletedIds.value.filter((id) => {
            const user = localOverrides.value[id]
            return !query || Boolean(user && `${user.firstName} ${user.lastName} ${user.username} ${user.email} ${user.phone}`.toLowerCase().includes(query))
          }).length +
          created.length,
      )
    } catch (cause) {
      if (requestId === requestSequence) {
        error.value = cause instanceof Error ? cause.message : 'Не вдалося завантажити користувачів.'
      }
    } finally {
      if (requestId === requestSequence) isLoading.value = false
    }
  }

  async function fetchUser(id: number): Promise<User> {
    const localUser = users.value.find((user) => user.id === id) ?? localOverrides.value[id]
    if (deletedIds.value.includes(id)) throw new Error('Користувача не знайдено.')
    return localUser ?? ServiceProvider.get<UserService>('users').getById(id)
  }

  async function createUser(data: CreateUserDto): Promise<User> {
    const created = await ServiceProvider.get<UserService>('users').create(data)
    const { password: _password, ...safeData } = data
    const user = { ...created, ...safeData }
    localOverrides.value[created.id] = user
    createdIds.value = [...createdIds.value, created.id]
    users.value = [user, ...users.value].slice(0, 10)
    total.value += 1
    return user
  }

  async function updateUser(id: number, data: UpdateUserDto): Promise<User> {
    const updated = await ServiceProvider.get<UserService>('users').update(id, data)
    const current = users.value.find((user) => user.id === id) ?? localOverrides.value[id]
    const { password: _password, ...safeData } = data
    const user: User = { ...current, ...updated, ...safeData }
    localOverrides.value[id] = user
    users.value = users.value.map((item) => (item.id === id ? user : item))
    return user
  }

  async function removeUser(id: number): Promise<void> {
    await ServiceProvider.get<UserService>('users').delete(id)
    const removed = users.value.find((user) => user.id === id)
    if (removed) localOverrides.value[id] = removed
    deletedIds.value = [...deletedIds.value, id]
    createdIds.value = createdIds.value.filter((createdId) => createdId !== id)
    users.value = users.value.filter((user) => user.id !== id)
    total.value = Math.max(0, total.value - 1)
  }

  return {
    users,
    total,
    isLoading,
    error,
    hasUsers,
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    removeUser,
  }
})
