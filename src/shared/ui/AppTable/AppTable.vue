<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

interface TableColumn {
  field: string
  header: string
}

defineProps<{
  rows: object[]
  columns: TableColumn[]
  loading?: boolean
}>()

function cellValue(row: object, field: string): unknown {
  return (row as Record<string, unknown>)[field]
}
</script>

<template>
  <DataTable :value="rows" :loading="loading" striped-rows responsive-layout="scroll">
    <Column v-for="column in columns" :key="column.field" :field="column.field" :header="column.header">
      <template #body="{ data }">
        <slot :name="column.field" :data="data">{{ cellValue(data, column.field) }}</slot>
      </template>
    </Column>
  </DataTable>
</template>
