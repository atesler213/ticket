<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  priority: string
}>()

const priorityClasses = computed(() => {
  switch (props.priority.toLowerCase()) {
    case 'low':
      return 'bg-gray-100 text-gray-700'
    case 'medium':
      return 'bg-blue-100 text-blue-700'
    case 'high':
      return 'bg-amber-100 text-amber-700'
    case 'urgent':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-600'
  }
})
</script>

<template>
  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="priorityClasses">
    {{ priority }}
  </span>
</template>
