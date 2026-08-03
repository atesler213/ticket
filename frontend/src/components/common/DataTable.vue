<script setup lang="ts">
import DataTable from 'primevue/datatable'

defineProps<{
  value: any[]
  loading?: boolean
}>()
</script>

<template>
  <div class="table-container">
    <DataTable 
      :value="value" 
      :loading="loading" 
      paginator 
      :rows="10" 
      responsiveLayout="scroll"
      tableClass="data-table w-full"
      unstyled
      :pt="{
        table: { class: 'w-full text-left border-collapse' },
        thead: { class: 'bg-gray-50 border-b border-gray-200' },
        headerRow: { class: 'text-xs font-semibold text-gray-500 uppercase tracking-wider' },
        bodyRow: { class: 'border-b border-gray-100 hover:bg-gray-50/50 transition-colors' },
        paginator: { class: 'flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200' }
      }"
    >
      <slot></slot>
    </DataTable>
  </div>
</template>

<style scoped>
/* Inherits base tailwind classes applied via PT (Pass Through) */
</style>
