<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-vue-next'

const props = defineProps<{
  title: string
  value: string | number
  trend?: number
  trendLabel?: string
}>()

const trendIcon = computed(() => {
  if (!props.trend) return Minus
  return props.trend > 0 ? ArrowUpRight : ArrowDownRight
})

const trendColor = computed(() => {
  if (!props.trend) return 'text-gray-400 bg-gray-50'
  return props.trend > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
})
</script>

<template>
  <div class="card card-no-hover animate-slide-up">
    <div class="p-5 flex flex-col justify-between h-full">
      <div class="text-sm font-medium text-gray-500">{{ title }}</div>
      <div class="mt-2 flex items-baseline gap-2">
        <div class="text-3xl font-bold text-gray-900 tracking-tight">{{ value }}</div>
        
        <div v-if="trend !== undefined" 
             class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold"
             :class="trendColor">
          <component :is="trendIcon" :size="14" />
          {{ Math.abs(trend) }}%
        </div>
      </div>
      <div v-if="trendLabel" class="mt-1 text-xs text-gray-400">{{ trendLabel }}</div>
    </div>
  </div>
</template>
