<script setup lang="ts">
import AppButton from './AppButton.vue'
import type { Participant, SortState } from '../types'

const props = defineProps<{
  participants: Participant[]
  sort: SortState
}>()

const emit = defineEmits<{
  sortChange: [field: 'name' | 'dateOfBirth']
  edit: [participant: Participant]
  delete: [participant: Participant]
}>()

const sortIcon = (field: 'name' | 'dateOfBirth') => {
  if (props.sort.key !== field) {
    return '↕'
  }

  return props.sort.direction === 'asc' ? '↑' : '↓'
}

const displayDate = (value: string) => {
  const [year, month, day] = value.split('-')
  return `${month}/${day}/${year}`
}
</script>

<template>
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead>
        <tr>
          <th>#</th>
          <th>
            <button type="button" class="btn btn-link p-0 text-decoration-none" @click="emit('sortChange', 'name')">
              Name {{ sortIcon('name') }}
            </button>
          </th>
          <th>
            <button type="button" class="btn btn-link p-0 text-decoration-none" @click="emit('sortChange', 'dateOfBirth')">
              Date of Birth {{ sortIcon('dateOfBirth') }}
            </button>
          </th>
          <th>Email</th>
          <th>Phone number</th>
          <th class="actions-heading"><span class="visually-hidden">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(participant, index) in participants" :key="participant.id">
          <td>{{ index + 1 }}</td>
          <td>{{ participant.name }}</td>
          <td>{{ displayDate(participant.dateOfBirth) }}</td>
          <td>{{ participant.email }}</td>
          <td>{{ participant.phone }}</td>
          <td class="actions-cell">
            <div class="table-actions">
              <AppButton
                variant="outline"
                :aria-label="`Edit ${participant.name}`"
                @click="emit('edit', participant)"
              >
                ✎
              </AppButton>
              <AppButton
                variant="danger"
                :aria-label="`Delete ${participant.name}`"
                @click="emit('delete', participant)"
              >
                ×
              </AppButton>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.btn-link {
  color: inherit;
  font-weight: 600;
}

.table {
  min-width: 550px;
  font-size: 12px;
}

.table th {
  color: #343b3d;
  white-space: nowrap;
}

.actions-heading {
  width: 48px;
}

.actions-cell {
  width: 48px;
}

.table-actions {
  display: flex;
  gap: 3px;
}

.table-actions :deep(.btn) {
  width: 22px;
  height: 22px;
  padding: 0;
  font-size: 12px;
  line-height: 1;
}
</style>
