<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { AppInput } from '@/shared/ui'

const emit = defineEmits<{
  'filter-by-name': [value: string]
}>()

const query = ref('')
let timeoutId: number | undefined

watch(
  query,
  (value) => {
    if (timeoutId) {
      window.clearTimeout(timeoutId)
    }

    timeoutId = window.setTimeout(() => {
      emit('filter-by-name', value.trim())
    }, 300)
  },
)

onBeforeUnmount(() => {
  if (timeoutId) {
    window.clearTimeout(timeoutId)
  }
})
</script>

<template>
  <div class="search-bar">
    <span aria-hidden="true">⌕</span>
    <AppInput
      v-model="query"
      type="search"
      class="form-control"
      placeholder="Search by name"
      aria-label="Search participants"
    />
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  width: min(100%, 175px);
  height: 25px;
  border: 1px solid #e7e7e7;
  border-radius: 3px;
  background: #fff;
  padding: 0 6px;
  color: #999;
}

.search-bar > span {
  font-size: 17px;
  line-height: 1;
}

.search-bar .form-control {
  min-height: 0;
  height: 23px;
  border: 0;
  background: transparent;
  padding: 2px 4px;
  font-size: 10px;
  box-shadow: none;
}
</style>
