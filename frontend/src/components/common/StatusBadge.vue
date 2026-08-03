<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
}>()

const statusClasses = computed(() => {
  switch (props.status.toLowerCase()) {
    case 'open':
      return 'bg-blue-100 text-blue-700'
    case 'pending':
      return 'bg-amber-100 text-amber-700'
    case 'resolved':
      return 'bg-emerald-100 text-emerald-700'
    case 'closed':
      return 'bg-gray-100 text-gray-700'
    default:
      return 'bg-gray-100 text-gray-600'
  }
})
</script>

<template>
  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="statusClasses">
    {{ status }}
  </span>
</template>
