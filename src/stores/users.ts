import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ServiceProvider } from '../services/service-provider'
import type { CreateUserDto, UpdateUserDto, User } from '../types'

interface UserPageOptions {
  page: number
  limit: number
  q: string
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref('')
  const localOverrides = ref<Record<number, User>>({})
  const createdIds = ref<number[]>([])
  const deletedIds = ref<number[]>([])
  let requestSequence = 0

  async function loadPage({ page, limit, q }: UserPageOptions): Promise<void> {
    const currentRequest = ++requestSequence
    isLoading.value = true
    error.value = ''

    try {
      const result = await ServiceProvider.users.getPage({
        limit,
        skip: (page - 1) * limit,
        q,
      })
      if (currentRequest !== requestSequence) return
      const filtered = result.users
        .filter((user) => !deletedIds.value.includes(user.id))
        .map((user) => localOverrides.value[user.id] ?? user)
      const localCreated = createdIds.value
        .map((id) => localOverrides.value[id])
        .filter(
          (user): user is User =>
            user !== undefined &&
            page === 1 &&
            (!q ||
              `${user.firstName} ${user.lastName} ${user.username} ${user.email} ${user.phone}`
                .toLowerCase()
                .includes(q.toLowerCase())),
        )
      users.value = [...localCreated, ...filtered.filter((user) => !createdIds.value.includes(user.id))].slice(
        0,
        limit,
      )
      total.value = Math.max(
        0,
        result.total -
          deletedIds.value.filter((id) => {
            const deleted = localOverrides.value[id]
            return !q || Boolean(deleted && `${deleted.firstName} ${deleted.lastName} ${deleted.username}`.toLowerCase().includes(q.toLowerCase()))
          }).length +
          localCreated.length,
      )
    } catch (cause) {
      if (currentRequest === requestSequence) {
        error.value = cause instanceof Error ? cause.message : 'Не вдалося завантажити користувачів.'
      }
    } finally {
      if (currentRequest === requestSequence) isLoading.value = false
    }
  }

  async function createUser(data: CreateUserDto): Promise<void> {
    const created = await ServiceProvider.users.create(data)
    const profileData: UpdateUserDto = { ...data }
    delete profileData.password
    localOverrides.value[created.id] = { ...created, ...profileData }
    createdIds.value = [...createdIds.value, created.id]
    users.value = [localOverrides.value[created.id]!, ...users.value].slice(0, 10)
    total.value += 1
  }

  async function updateUser(id: number, data: UpdateUserDto): Promise<User> {
    const updated = await ServiceProvider.users.update(id, data)
    const current = users.value.find((user) => user.id === id)
    const profileData = { ...data }
    delete profileData.password
    const merged = { ...current, ...updated, ...profileData } as User
    localOverrides.value[id] = merged
    users.value = users.value.map((user) => (user.id === id ? merged : user))
    return merged
  }

  async function deleteUser(id: number): Promise<void> {
    await ServiceProvider.users.delete(id)
    const deletedUser = users.value.find((user) => user.id === id)
    if (deletedUser) localOverrides.value[id] = deletedUser
    deletedIds.value = [...deletedIds.value, id]
    createdIds.value = createdIds.value.filter((createdId) => createdId !== id)
    users.value = users.value.filter((user) => user.id !== id)
    total.value = Math.max(0, total.value - 1)
  }

  async function getUser(id: number): Promise<User> {
    const localUser = users.value.find((user) => user.id === id)
    return localUser ?? ServiceProvider.users.getById(id)
  }

  return { users, total, isLoading, error, loadPage, createUser, updateUser, deleteUser, getUser }
})
