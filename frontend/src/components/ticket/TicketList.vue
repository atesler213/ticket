<script setup lang="ts">
import type { Ticket } from '../../types/Ticket'
import StatusBadge from '../common/StatusBadge.vue'
import PriorityBadge from '../common/PriorityBadge.vue'
import { MessageSquare } from 'lucide-vue-next'

defineProps<{
  tickets: Ticket[],
  isAgentView?: boolean
}>()

function viewTicket(_id: string) {
  // router logic here
}

function formatDate(iso: string) {
  const date = new Date(iso)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}
</script>

<template>
  <div class="table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th>Ticket</th>
          <th>Subject</th>
          <th>Status</th>
          <th>Priority</th>
          <th v-if="isAgentView">Assignee</th>
          <th>Created</th>
          <th class="text-right">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ticket in tickets" :key="ticket.id" @click="viewTicket(ticket.id)" class="cursor-pointer hover:bg-gray-50/50">
          <td class="font-medium text-gray-900">{{ ticket.id }}</td>
          <td>
            <div class="text-gray-900 font-medium">{{ ticket.title }}</div>
            <div class="text-sm text-gray-500 truncate max-w-xs">{{ ticket.description }}</div>
          </td>
          <td><StatusBadge :status="ticket.status" /></td>
          <td><PriorityBadge :priority="ticket.priority" /></td>
          <td v-if="isAgentView" class="text-gray-500">
            <span v-if="ticket.assigneeId" class="inline-flex items-center gap-1.5"><div class="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">AG</div> Agent</span>
            <span v-else class="italic text-gray-400">Unassigned</span>
          </td>
          <td class="text-gray-500">{{ formatDate(ticket.createdAt) }}</td>
          <td class="text-right">
            <button class="btn btn-secondary btn-sm" @click.stop="viewTicket(ticket.id)">View</button>
          </td>
        </tr>
        <tr v-if="tickets.length === 0">
          <td colspan="6" class="text-center py-8 text-gray-500">
            <MessageSquare class="mx-auto h-8 w-8 text-gray-300 mb-2" />
            No tickets found.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
