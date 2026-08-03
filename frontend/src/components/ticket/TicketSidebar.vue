<script setup lang="ts">
import type { Ticket } from '../../types/Ticket'
import StatusBadge from '../common/StatusBadge.vue'
import PriorityBadge from '../common/PriorityBadge.vue'
import { Tag, Monitor, Building2 } from 'lucide-vue-next'

defineProps<{
  ticket: Ticket
}>()
</script>

<template>
  <div class="space-y-6">
    <!-- Properties Card -->
    <div class="card card-no-hover p-5">
      <h3 class="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Properties</h3>
      <div class="space-y-4">
        <div>
          <div class="text-xs text-gray-500 mb-1">Status</div>
          <StatusBadge :status="ticket.status" />
        </div>
        <div>
          <div class="text-xs text-gray-500 mb-1">Priority</div>
          <PriorityBadge :priority="ticket.priority" />
        </div>
        <div>
          <div class="text-xs text-gray-500 mb-1">Category</div>
          <div class="flex items-center text-sm text-gray-900">
            <Tag :size="14" class="mr-2 text-gray-400" />
            {{ ticket.categoryId === 'cat-1' ? 'Network' : 'Hardware' }}
          </div>
        </div>
        <div>
          <div class="text-xs text-gray-500 mb-1">Department</div>
          <div class="flex items-center text-sm text-gray-900">
            <Building2 :size="14" class="mr-2 text-gray-400" />
            IT Infrastructure
          </div>
        </div>
      </div>
    </div>

    <!-- Related Assets -->
    <div class="card card-no-hover p-5" v-if="ticket.assetId">
      <h3 class="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Related Asset</h3>
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
          <Monitor :size="20" />
        </div>
        <div>
          <div class="font-medium text-sm text-gray-900">Primary Laptop</div>
          <div class="text-xs text-gray-500 mt-0.5">{{ ticket.assetId }}</div>
          <a href="#" class="text-xs text-blue-600 font-medium hover:underline mt-1 block">View Asset</a>
        </div>
      </div>
    </div>
  </div>
</template>
