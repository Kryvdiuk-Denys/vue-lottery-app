<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ParticipantForm } from '@/features/lottery-registration'
import { SearchBar } from '@/features/lottery-search'
import type { ParticipantFormValues, Participant, SortState } from '@/entities/lottery'
import { ParticipantsTable } from '@/widgets/lottery-participants'
import { WinnersPanel } from '@/widgets/lottery-winners'
import { AppButton, ModalDialog } from '@/shared/ui'

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

const isWinnerSelectionDisabled = computed(
  () =>
    !participants.value.length ||
    winnerIds.value.length >= 3 ||
    participants.value.every((participant) => winnerIds.value.includes(participant.id)),
)

const winnerParticipants = computed(() =>
  participants.value.filter((participant) => winnerIds.value.includes(participant.id)),
)

const filteredParticipants = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()
  const list = query
    ? participants.value.filter((participant) => participant.name.toLowerCase().includes(query))
    : [...participants.value]

  return list.sort((left, right) => {
    const a = sortState.value.key === 'name' ? left.name.toLowerCase() : left.dateOfBirth
    const b = sortState.value.key === 'name' ? right.name.toLowerCase() : right.dateOfBirth
    const result = a.localeCompare(b)
    return sortState.value.direction === 'asc' ? result : -result
  })
})

const hasDuplicateEmail = (email: string, excludedId?: number) =>
  participants.value.some(
    (participant) => participant.id !== excludedId && participant.email.toLowerCase() === email.toLowerCase(),
  )

onMounted(() => {
  const storedParticipants = localStorage.getItem(STORAGE_KEY)
  if (!storedParticipants) return

  try {
    participants.value = JSON.parse(storedParticipants) as Participant[]
  } catch (error) {
    console.error('Unable to read saved lottery participants.', error)
    localStorage.removeItem(STORAGE_KEY)
  }
})

watch(participants, (value) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)), { deep: true })

function handleRegistrationSubmit(values: ParticipantFormValues): void {
  if (hasDuplicateEmail(values.email)) {
    registrationEmailError.value = 'Такий e-mail вже існує в системі.'
    return
  }
  participants.value.unshift({ id: Date.now(), ...values })
  formResetKey.value += 1
  registrationEmailError.value = ''
}

function handleEditSubmit(values: ParticipantFormValues): void {
  if (!editedParticipant.value) return
  if (hasDuplicateEmail(values.email, editedParticipant.value.id)) {
    editEmailError.value = 'Такий e-mail вже існує в системі.'
    return
  }
  participants.value = participants.value.map((participant) =>
    participant.id === editedParticipant.value?.id ? { ...participant, ...values } : participant,
  )
  isEditModalOpen.value = false
  editedParticipant.value = null
  editEmailError.value = ''
}

function pickRandomWinner(): void {
  if (isWinnerSelectionDisabled.value) return
  const eligible = participants.value.filter((participant) => !winnerIds.value.includes(participant.id))
  const nextWinner = eligible[Math.floor(Math.random() * eligible.length)]
  if (nextWinner) winnerIds.value = [...winnerIds.value, nextWinner.id]
}

function toggleSort(field: 'name' | 'dateOfBirth'): void {
  if (sortState.value.key === field) {
    sortState.value.direction = sortState.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sortState.value = { key: field, direction: 'asc' }
  }
}

function confirmDeleteParticipant(): void {
  const id = participantToDelete.value?.id
  if (id === undefined) return
  participants.value = participants.value.filter((participant) => participant.id !== id)
  winnerIds.value = winnerIds.value.filter((winnerId) => winnerId !== id)
  isDeleteModalOpen.value = false
  participantToDelete.value = null
}
</script>

<template>
  <main>
    <section class="home-intro">
      <div>
        <p class="eyebrow">VUE 3 · ROUTING LAB</p>
        <h1>Lottery participants manager</h1>
        <p>
          Навчальний застосунок для керування учасниками розіграшу та користувачами DummyJSON.
          Створений із Vue 3, TypeScript, Vue Router, Pinia, SCSS і REST API.
        </p>
      </div>
      <a class="text-link" href="https://github.com/Kryvdiuk-Denys/vue-lottery-app" target="_blank" rel="noreferrer">
        Переглянути проєкт на GitHub ↗
      </a>
    </section>

    <div class="lottery-app">
      <div class="lottery-shell">
        <div class="winner-row">
          <WinnersPanel :winners="winnerParticipants" @delete-winner="(id) => (winnerIds = winnerIds.filter((item) => item !== id))" />
          <AppButton class="new-winner-button" :disabled="isWinnerSelectionDisabled" @click="pickRandomWinner">
            New winner
          </AppButton>
        </div>

        <section class="lottery-card registration-card">
          <div class="registration-heading">
            <h2>REGISTER FORM</h2>
            <p>Please fill in all the fields.</p>
          </div>
          <ParticipantForm
            :key="formResetKey"
            :custom-errors="{ email: registrationEmailError }"
            @submit="handleRegistrationSubmit"
          />
        </section>

        <section class="lottery-card participants-card" aria-label="Lottery participants">
          <div class="participants-toolbar">
            <span class="visually-hidden">Search participants</span>
            <SearchBar @filter-by-name="(value) => (searchTerm = value)" />
          </div>
          <ParticipantsTable
            :participants="filteredParticipants"
            :sort="sortState"
            @sort-change="toggleSort"
            @edit="(participant) => { editedParticipant = { ...participant }; isEditModalOpen = true; editEmailError = '' }"
            @delete="(participant) => { participantToDelete = participant; isDeleteModalOpen = true }"
          />
        </section>
      </div>

      <ModalDialog v-model="isEditModalOpen" title="Редагувати дані учасника" size="lg">
        <ParticipantForm
          v-if="editedParticipant"
          :initial-values="editedParticipant"
          submit-label="Оновити дані"
          show-cancel
          :custom-errors="{ email: editEmailError }"
          @submit="handleEditSubmit"
          @cancel="isEditModalOpen = false"
        />
      </ModalDialog>
      <ModalDialog v-model="isDeleteModalOpen" title="Підтвердження видалення" size="sm">
        <p v-if="participantToDelete" class="mb-4">
          Видалити учасника «{{ participantToDelete.name }}», {{ participantToDelete.email }}?
        </p>
        <div class="d-flex justify-content-end gap-2">
          <AppButton variant="secondary" @click="isDeleteModalOpen = false">Ні</AppButton>
          <AppButton variant="danger" @click="confirmDeleteParticipant">Так</AppButton>
        </div>
      </ModalDialog>
    </div>
  </main>
</template>

<style scoped>
.home-intro {
  display: flex;
  width: min(100% - 40px, 1060px);
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  margin: 36px auto 20px;
  border: 1px solid #e5edef;
  border-radius: 14px;
  background: #fff;
  padding: 24px 28px;
}

.home-intro > div {
  max-width: 680px;
}

.home-intro h1,
.home-intro p {
  margin: 0;
}

.home-intro h1 {
  margin-bottom: 8px;
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 700;
}

.home-intro p:not(.eyebrow) {
  color: #6e7b83;
  line-height: 1.6;
}

.eyebrow {
  margin-bottom: 7px !important;
  color: #0aafc8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.text-link {
  flex: 0 0 auto;
  color: #087f91;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}

.text-link:hover {
  text-decoration: underline;
}

.lottery-app {
  min-height: 100vh;
  padding: 20px 24px 64px;
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

.registration-heading h2 {
  margin: 0;
  color: #30383a;
  font-size: 12px;
  font-weight: 700;
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
  .home-intro {
    width: calc(100% - 24px);
    align-items: flex-start;
    flex-direction: column;
    margin-top: 20px;
    padding: 18px;
  }

  .lottery-app {
    padding: 18px 14px 36px;
  }

  .winner-row {
    gap: 8px;
    padding: 8px;
  }
}
</style>
