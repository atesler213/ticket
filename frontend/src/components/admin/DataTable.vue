<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  items: any[]
  totalItems?: number
  currentPage?: number
  itemsPerPage?: number
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
}>()

const total = computed(() => props.totalItems ?? props.items.length)
const page = computed(() => props.currentPage ?? 1)
const perPage = computed(() => props.itemsPerPage ?? 10)

const totalPages = computed(() => Math.ceil(total.value / perPage.value))

const startItem = computed(() => {
  if (total.value === 0) return 0
  return (page.value - 1) * perPage.value + 1
})

const endItem = computed(() => {
  return Math.min(page.value * perPage.value, total.value)
})

function prevPage() {
  if (page.value > 1) emit('page-change', page.value - 1)
}

function nextPage() {
  if (page.value < totalPages.value) emit('page-change', page.value + 1)
}
</script>

<template>
  <div class="table-container animate-slide-up">
    <table>
      <thead>
        <tr>
          <slot name="header"></slot>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="100%" class="text-center py-8 text-gray-500">Loading data...</td>
        </tr>
        <tr v-else-if="items.length === 0">
          <td colspan="100%" class="text-center py-8 text-gray-500">No records found.</td>
        </tr>
        <template v-else>
          <tr v-for="(item, index) in items" :key="item.id || index">
            <slot name="row" :item="item" :index="index"></slot>
          </tr>
        </template>
      </tbody>
    </table>
    
    <div class="pagination" v-if="totalPages > 1">
      <div class="pagination-info">Showing {{ startItem }}–{{ endItem }} of {{ total }} records</div>
      <div class="pagination-pages">
        <button class="pagination-btn" :disabled="page === 1" @click="prevPage">
          <ChevronLeft :size="16" />
        </button>
        <button class="pagination-btn" 
                v-for="p in totalPages" 
                :key="p" 
                :class="{ active: p === page }"
                @click="emit('page-change', p)">
          {{ p }}
        </button>
        <button class="pagination-btn" :disabled="page === totalPages" @click="nextPage">
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>
