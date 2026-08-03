<script setup lang="ts">
import { ref } from 'vue'
import type { Ticket, TicketPriority, TicketStatus } from '../../types/Ticket'
import { Tag, Monitor, Building2, User } from 'lucide-vue-next'

const props = defineProps<{
  ticket: Ticket
}>()

const emit = defineEmits<{
  (e: 'update', updates: Partial<Ticket>): void
}>()

const isEditingStatus = ref(false)
const isEditingPriority = ref(false)
const isEditingAssignee = ref(false)

const draftStatus = ref<TicketStatus>(props.ticket.status)
const draftPriority = ref<TicketPriority>(props.ticket.priority)
const draftAssigneeId = ref<string | undefined>(props.ticket.assigneeId)

function saveStatus() {
  emit('update', { status: draftStatus.value })
  isEditingStatus.value = false
}

function savePriority() {
  emit('update', { priority: draftPriority.value })
  isEditingPriority.value = false
}

function saveAssignee() {
  emit('update', { assigneeId: draftAssigneeId.value || undefined })
  isEditingAssignee.value = false
}
</script>

<template>
  <div class="space-y-6">
    
    <!-- SLA Card if breached -->
    <div v-if="ticket.sla?.isBreached" class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
      <div class="text-red-600 mt-0.5">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <div>
        <h4 class="font-semibold text-red-800 text-sm">SLA Breached</h4>
        <p class="text-red-600 text-xs mt-1">This ticket has exceeded its resolution time target.</p>
      </div>
    </div>

    <!-- Properties Card -->
    <div class="card card-no-hover p-5">
      <h3 class="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Properties</h3>
      <div class="space-y-4">
        
        <!-- Status -->
        <div>
          <div class="text-xs text-gray-500 mb-1 flex justify-between">
            Status
            <button @click="isEditingStatus = !isEditingStatus" class="text-blue-600 hover:underline">{{ isEditingStatus ? 'Cancel' : 'Edit' }}</button>
          </div>
          <div v-if="!isEditingStatus">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{{ ticket.status }}</span>
          </div>
          <div v-else class="flex gap-2">
            <select v-model="draftStatus" class="form-select text-sm py-1 h-auto">
              <option value="Open">Open</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            <button @click="saveStatus" class="btn btn-primary btn-sm">Save</button>
          </div>
        </div>
        
        <!-- Priority -->
        <div>
          <div class="text-xs text-gray-500 mb-1 flex justify-between">
            Priority
            <button @click="isEditingPriority = !isEditingPriority" class="text-blue-600 hover:underline">{{ isEditingPriority ? 'Cancel' : 'Edit' }}</button>
          </div>
          <div v-if="!isEditingPriority">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                  :class="{
                    'bg-red-100 text-red-800': ticket.priority === 'Urgent',
                    'bg-orange-100 text-orange-800': ticket.priority === 'High',
                    'bg-yellow-100 text-yellow-800': ticket.priority === 'Medium',
                    'bg-green-100 text-green-800': ticket.priority === 'Low'
                  }">
              {{ ticket.priority }}
            </span>
          </div>
          <div v-else class="flex gap-2">
            <select v-model="draftPriority" class="form-select text-sm py-1 h-auto">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
            <button @click="savePriority" class="btn btn-primary btn-sm">Save</button>
          </div>
        </div>

        <!-- Assignee -->
        <div>
          <div class="text-xs text-gray-500 mb-1 flex justify-between">
            Assignee
            <button @click="isEditingAssignee = !isEditingAssignee" class="text-blue-600 hover:underline">{{ isEditingAssignee ? 'Cancel' : 'Edit' }}</button>
          </div>
          <div v-if="!isEditingAssignee" class="flex items-center text-sm text-gray-900">
            <User :size="14" class="mr-2 text-gray-400" />
            {{ ticket.assigneeId ? 'Agent Assigned' : 'Unassigned' }}
          </div>
          <div v-else class="flex gap-2">
            <select v-model="draftAssigneeId" class="form-select text-sm py-1 h-auto">
              <option value="">Unassigned</option>
              <option value="usr-1">System Admin</option>
              <option value="usr-2">Support Agent</option>
            </select>
            <button @click="saveAssignee" class="btn btn-primary btn-sm">Save</button>
          </div>
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
