<script setup lang="ts">
import type { TicketEvent } from '../../types/Ticket'

defineProps<{
  events: TicketEvent[]
}>()

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: 'numeric'
  }).format(d)
}
</script>

<template>
  <div class="space-y-6">
    <div v-for="event in events" :key="event.id" class="flex gap-4">
      <!-- Avatar -->
      <div class="flex-shrink-0">
        <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold border border-gray-200">
          <!-- Fallback avatar logic based on actorId mock -->
          {{ event.actorId.startsWith('usr-1') ? 'AD' : event.actorId.startsWith('usr-2') ? 'AG' : 'EM' }}
        </div>
      </div>
      
      <!-- Content -->
      <div class="flex-1 rounded-lg border shadow-sm p-4"
           :class="event.isInternal ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'">
        <div class="flex justify-between items-center mb-2">
          <div class="font-medium flex items-center gap-2" :class="event.isInternal ? 'text-yellow-800' : 'text-gray-900'">
             {{ event.actorId.startsWith('usr-1') ? 'System Admin' : event.actorId.startsWith('usr-2') ? 'Support Agent' : 'Employee' }}
             <span v-if="event.isInternal" class="text-xs px-1.5 py-0.5 rounded bg-yellow-200 text-yellow-800 font-semibold uppercase tracking-wider">Internal</span>
          </div>
          <div class="text-xs" :class="event.isInternal ? 'text-yellow-600' : 'text-gray-500'">{{ formatDateTime(event.createdAt) }}</div>
        </div>
        <div class="text-sm whitespace-pre-wrap" :class="event.isInternal ? 'text-yellow-900' : 'text-gray-700'">{{ event.content }}</div>
      </div>
    </div>
    
    <div v-if="!events || events.length === 0" class="text-center py-8 text-gray-500">
      No replies yet.
    </div>
  </div>
</template>
