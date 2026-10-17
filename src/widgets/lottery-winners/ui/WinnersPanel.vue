<script setup lang="ts">
import type { Participant } from '@/entities/lottery'

defineProps<{
  winners: Participant[]
}>()

const emit = defineEmits<{
  deleteWinner: [winnerId: number]
}>()
</script>

<template>
  <div class="winners-input" aria-label="Winners">
    <span v-if="!winners.length" class="winners-placeholder">Winners</span>
    <span v-for="winner in winners" :key="winner.id" class="winner-chip">
      <span>{{ winner.name }}</span>
      <button
        type="button"
        :aria-label="`Remove ${winner.name} from winners`"
        @click="emit('deleteWinner', winner.id)"
      >
        ×
      </button>
    </span>
    <span class="visually-hidden">{{ winners.length }} of 3 winners</span>
    <span class="winner-count">{{ winners.length }}/3</span>
  </div>
</template>

<style scoped>
.winners-input {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  min-width: 0;
  min-height: 30px;
  gap: 5px;
  overflow: hidden;
  border: 1px solid #e1e1e1;
  border-radius: 4px;
  background: #fff;
  padding: 4px 7px;
  color: #a2a2a2;
  font-size: 12px;
}

.winners-placeholder {
  padding-left: 1px;
}

.winner-chip {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 5px;
  border-radius: 2px;
  background: #0eb0c9;
  padding: 3px 5px;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
}

.winner-chip button {
  border: 0;
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: 13px;
  font-weight: 700;
  line-height: 0.8;
}

.winner-count {
  margin-left: auto;
  color: #b0b0b0;
  font-size: 10px;
}

@media (max-width: 420px) {
  .winner-count {
    display: none;
  }
}
</style>
