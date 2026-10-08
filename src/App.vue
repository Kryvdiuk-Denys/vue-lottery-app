<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppButton from './components/AppButton.vue'
import ModalDialog from './components/ModalDialog.vue'
import ParticipantForm from './components/ParticipantForm.vue'
import ParticipantsTable from './components/ParticipantsTable.vue'
import SearchBar from './components/SearchBar.vue'
import WinnersPanel from './components/WinnersPanel.vue'
import type { Participant, ParticipantFormValues, SortState } from './types'

const STORAGE_KEY = 'lottery-participants'

const participants = ref<Participant[]>([])
const winnerIds = ref<number[]>([])
const searchTerm = ref('')
const sortState = ref<SortState>({ key: 'name', direction: 'asc' })
const formResetKey = ref(0)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const editedParticipant = ref<Participant | null>(null)
const participantToDelete = ref<Participant | null>(null)
const registrationEmailError = ref('')
const editEmailError = ref('')

const isWinnerSelectionDisabled = computed(() => {
  if (!participants.value.length) {
    return true
  }

  return winnerIds.value.length >= 3 || participants.value.every((participant) => winnerIds.value.includes(participant.id))
})

const winnerParticipants = computed(() => {
  return participants.value.filter((participant) => winnerIds.value.includes(participant.id))
})

const filteredParticipants = computed(() => {
  const normalizedQuery = searchTerm.value.trim().toLowerCase()
  const list = normalizedQuery
    ? participants.value.filter((participant) => participant.name.toLowerCase().includes(normalizedQuery))
    : [...participants.value]

  return [...list].sort((left, right) => {
    const leftValue = sortState.value.key === 'name' ? left.name.toLowerCase() : left.dateOfBirth
    const rightValue = sortState.value.key === 'name' ? right.name.toLowerCase() : right.dateOfBirth

    if (leftValue < rightValue) {
      return sortState.value.direction === 'asc' ? -1 : 1
    }

    if (leftValue > rightValue) {
      return sortState.value.direction === 'asc' ? 1 : -1
    }

    return 0
  })
})

const hasDuplicateEmail = (email: string, excludedId?: number) => {
  return participants.value.some(
    (participant) => participant.id !== excludedId && participant.email.toLowerCase() === email.toLowerCase(),
  )
}

onMounted(() => {
  const savedParticipants = localStorage.getItem(STORAGE_KEY)

  if (savedParticipants) {
    try {
      const parsedParticipants = JSON.parse(savedParticipants) as Participant[]
      participants.value = parsedParticipants
    } catch {
      participants.value = []
    }
  } else {
    participants.value = []
  }
})

watch(
  () => participants.value,
  (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  },
  { deep: true },
)

const resetRegistrationErrors = () => {
  registrationEmailError.value = ''
}

const resetRegistrationForm = () => {
  formResetKey.value += 1
  resetRegistrationErrors()
}

const resetEditErrors = () => {
  editEmailError.value = ''
}

const handleRegistrationSubmit = (values: ParticipantFormValues) => {
  if (hasDuplicateEmail(values.email)) {
    registrationEmailError.value = 'Такий e-mail вже існує в системі.'
    return
  }

  participants.value.unshift({
    id: Date.now(),
    ...values,
  })

  formResetKey.value += 1
  resetRegistrationErrors()
}

const handleEditSubmit = (values: ParticipantFormValues) => {
  if (!editedParticipant.value) {
    return
  }

  if (hasDuplicateEmail(values.email, editedParticipant.value.id)) {
    editEmailError.value = 'Такий e-mail вже існує в системі.'
    return
  }

  participants.value = participants.value.map((participant) =>
    participant.id === editedParticipant.value?.id ? { ...participant, ...values } : participant,
  )

  isEditModalOpen.value = false
  editedParticipant.value = null
  resetEditErrors()
}

const pickRandomWinner = () => {
  if (isWinnerSelectionDisabled.value) {
    return
  }

  const eligibleParticipants = participants.value.filter(
    (participant) => !winnerIds.value.includes(participant.id),
  )

  if (!eligibleParticipants.length) {
    return
  }

  const randomIndex = Math.floor(Math.random() * eligibleParticipants.length)
  const nextWinner = eligibleParticipants[randomIndex]

  if (!nextWinner) {
    return
  }

  winnerIds.value = [...winnerIds.value, nextWinner.id]
}

const removeWinner = (winnerId: number) => {
  winnerIds.value = winnerIds.value.filter((id) => id !== winnerId)
}

const toggleSort = (field: 'name' | 'dateOfBirth') => {
  if (sortState.value.key === field) {
    sortState.value.direction = sortState.value.direction === 'asc' ? 'desc' : 'asc'
    return
  }

  sortState.value = {
    key: field,
    direction: 'asc',
  }
}

const openEditModal = (participant: Participant) => {
  editedParticipant.value = { ...participant }
  isEditModalOpen.value = true
  resetEditErrors()
}

const closeEditModal = () => {
  isEditModalOpen.value = false
  editedParticipant.value = null
  resetEditErrors()
}

const openDeleteModal = (participant: Participant) => {
  participantToDelete.value = participant
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  participantToDelete.value = null
}

const confirmDeleteParticipant = () => {
  if (!participantToDelete.value) {
    return
  }

  const leavingParticipantId = participantToDelete.value.id
  participants.value = participants.value.filter((participant) => participant.id !== leavingParticipantId)
  winnerIds.value = winnerIds.value.filter((winnerId) => winnerId !== leavingParticipantId)
  closeDeleteModal()
}
</script>

<template>
  <main class="lottery-app">
    <div class="lottery-shell">
      <div class="winner-row">
        <WinnersPanel :winners="winnerParticipants" @delete-winner="removeWinner" />
        <AppButton
          class="new-winner-button"
          :disabled="isWinnerSelectionDisabled"
          type="button"
          @click="pickRandomWinner"
        >
          New winner
        </AppButton>
      </div>

      <section class="lottery-card registration-card">
        <div class="registration-heading">
          <h1>REGISTER FORM</h1>
          <p>Please fill in all the fields.</p>
        </div>
        <ParticipantForm
          :key="formResetKey"
          :custom-errors="{ email: registrationEmailError }"
          @submit="handleRegistrationSubmit"
          @cancel="resetRegistrationForm"
        />
      </section>

      <section class="lottery-card participants-card" aria-label="Participants">
        <div class="participants-toolbar">
          <span class="visually-hidden">Search participants</span>
          <SearchBar @filter-by-name="(value) => (searchTerm = value)" />
        </div>
        <ParticipantsTable
          :participants="filteredParticipants"
          :sort="sortState"
          @sort-change="toggleSort"
          @edit="openEditModal"
          @delete="openDeleteModal"
        />
      </section>
    </div>

    <ModalDialog v-model="isEditModalOpen" title="Редагувати дані учасника" size="lg" @close="closeEditModal">
      <ParticipantForm
        v-if="editedParticipant"
        :initial-values="editedParticipant"
        submit-label="Оновити дані"
        show-cancel
        :custom-errors="{ email: editEmailError }"
        @submit="handleEditSubmit"
        @cancel="closeEditModal"
      />
    </ModalDialog>

    <ModalDialog v-model="isDeleteModalOpen" title="Підтвердження видалення" size="sm" @close="closeDeleteModal">
      <p v-if="participantToDelete" class="mb-4">
        Ви дійсно бажаєте видалити учасника "{{ participantToDelete.name }}", {{ participantToDelete.email }}?
      </p>

      <div class="d-flex justify-content-end gap-2">
        <AppButton variant="secondary" @click="closeDeleteModal">Ні</AppButton>
        <AppButton variant="danger" @click="confirmDeleteParticipant">Так</AppButton>
      </div>
    </ModalDialog>
  </main>
</template>

<style scoped>
.lottery-app {
  min-height: 100vh;
  padding: 106px 24px 64px;
  background: #f4f4f4;
}

.lottery-shell {
  width: min(100%, 602px);
  margin: 0 auto;
}

.winner-row {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 56px;
  margin-bottom: 14px;
  padding: 10px 15px;
}

.new-winner-button {
  flex: 0 0 auto;
}

.lottery-card {
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  background: #fff;
}

.registration-card {
  margin-bottom: 14px;
  padding: 14px 15px 15px;
}

.registration-heading {
  margin-bottom: 18px;
}

.registration-heading h1 {
  margin: 0;
  color: #30383a;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
}

.registration-heading p {
  margin: 2px 0 0;
  color: #a8b0b2;
  font-size: 12px;
}

.participants-card {
  padding: 12px 14px;
}

.participants-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 4px;
}

@media (max-width: 640px) {
  .lottery-app {
    padding: 24px 14px;
  }

  .winner-row {
    gap: 8px;
    padding: 8px;
  }
}
</style>
