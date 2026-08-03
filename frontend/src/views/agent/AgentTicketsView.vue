<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTicketStore } from '../../stores/ticket'
import { useAuthStore } from '../../stores/auth'
import { formatDistanceToNow } from 'date-fns'

const route = useRoute()
const ticketStore = useTicketStore()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const tickets = computed(() => ticketStore.tickets)
const activeTab = ref(route.query.queue as string || 'all')
const isPrivilegedUser = computed(() => {
  return user.value?.role === 'CISO / ISB' || user.value?.role === 'Security Manager'
})

// Watch route query to update activeTab if navigating from dashboard link
watch(() => route.query.queue, (newQueue) => {
  if (newQueue) {
    activeTab.value = newQueue as string
  }
})

onMounted(() => {
  ticketStore.fetchAllTickets()
})

const filteredTickets = computed(() => {
  let list = tickets.value
  if (activeTab.value === 'my') {
    list = list.filter(t => t.assigneeId === user.value?.id)
  } else if (activeTab.value === 'unassigned') {
    list = list.filter(t => !t.assigneeId)
  } else if (activeTab.value === 'sensitive') {
    if (!isPrivilegedUser.value) {
      return []
    }
    list = list.filter(t =>
      t.ticketType === 'Incident' &&
      (t.dataClassification === 'Confidential' || t.dataClassification === 'Restricted' || t.isSensitiveQueue)
    )
  }
  return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Logged': return 'badge-open'
    case 'Triage': return 'badge-inprogress'
    case 'Assessment': return 'badge-pending'
    case 'Mitigation & Containment': return 'badge-inprogress'
    case 'Evidence Collection': return 'badge-pending'
    case 'Pending Verification': return 'badge-pending'
    case 'Audit Ready': return 'badge-resolved'
    case 'False Positive': return 'badge-closed'
    case 'Open': return 'badge-open'
    case 'In Progress': return 'badge-inprogress'
    case 'Pending': return 'badge-pending'
    case 'Resolved': return 'badge-resolved'
    case 'Closed': return 'badge-closed'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateStr: string) => {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-8 animate-slide-up">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          <span v-if="activeTab === 'all'">All Tickets</span>
          <span v-else-if="activeTab === 'my'">My Queue</span>
          <span v-else-if="activeTab === 'unassigned'">Unassigned Tickets</span>
          <span v-else-if="activeTab === 'sensitive'">Sensitive Security Incidents</span>
        </h1>
        <p class="text-gray-500 mt-1">Manage and resolve employee IT requests.</p>
      </div>
      <div class="flex gap-3">
        <button class="btn btn-secondary h-10"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export</button>
        <button class="btn btn-primary h-10"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" class="mr-2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New Ticket</button>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="card card-no-hover animate-slide-up" style="animation-delay: 50ms;">
      <div class="card-header" style="padding: 12px 24px;">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div class="tabs" style="border-bottom:none; margin-bottom:0;">
            <button class="tab" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'" style="padding-top:0; padding-bottom:0; height:36px;">All Tickets</button>
            <button class="tab" :class="{ active: activeTab === 'my' }" @click="activeTab = 'my'" style="padding-top:0; padding-bottom:0; height:36px;">My Queue</button>
            <button class="tab" :class="{ active: activeTab === 'unassigned' }" @click="activeTab = 'unassigned'" style="padding-top:0; padding-bottom:0; height:36px;">Unassigned</button>
            <button v-if="isPrivilegedUser" class="tab" :class="{ active: activeTab === 'sensitive' }" @click="activeTab = 'sensitive'" style="padding-top:0; padding-bottom:0; height:36px;">Sensitive Incidents</button>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="topbar-search" style="width:280px; margin:0;"><svg class="topbar-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="Search tickets..."><span class="topbar-search-shortcut">⌘ K</span></div>
            <button class="btn btn-secondary" style="height:38px; padding:0 14px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" class="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> Filters</button>
          </div>
        </div>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;"><input type="checkbox" class="rounded"></th>
            <th>Ticket ID</th>
            <th>Subject</th>
            <th>Requester</th>
            <th>Assigned To</th>
            <th>Status</th>
            <th>Type</th>
            <th>Priority</th>
            <th>SLA</th>
            <th>Updated</th>
            <th style="width: 40px;"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="ticketStore.isLoading">
            <td colspan="11" class="text-center py-8 text-gray-400">Loading tickets...</td>
          </tr>
          <tr v-else-if="filteredTickets.length === 0">
            <td colspan="11" class="text-center py-8 text-gray-400">No tickets found.</td>
          </tr>
          <tr v-else v-for="ticket in filteredTickets" :key="ticket.id">
            <td style="text-align: center;"><input type="checkbox" class="rounded"></td>
            <td><router-link :to="{ name: 'agent.ticket.detail', params: { id: ticket.id } }" class="table-ticket-id">#{{ ticket.id }}</router-link></td>
            <td class="font-medium text-gray-900">{{ ticket.title }}</td>
            <td>
              <div class="flex items-center gap-2">
                <div class="avatar avatar-blue" style="width:24px;height:24px;font-size:10px;">{{ ticket.requesterId.substring(0,2).toUpperCase() }}</div>
                User
              </div>
            </td>
            <td>
              <div class="flex items-center gap-2" v-if="ticket.assigneeId">
                <div class="avatar avatar-green" style="width:24px;height:24px;font-size:10px;">AG</div>
                Support Agent
              </div>
              <span class="text-gray-400 text-xs" v-else>Unassigned</span>
            </td>
            <td><span class="badge" :class="getStatusClass(ticket.status)">{{ ticket.status }}</span></td>
            <td><span class="text-xs text-gray-600 font-semibold">{{ ticket.ticketType || 'ServiceHR' }}</span></td>
            <td><span class="priority"><span class="priority-dot" :class="`priority-dot-${ticket.priority.toLowerCase()}`"></span> {{ ticket.priority }}</span></td>
            <td><span class="badge-sla-ok" style="font-size:11px;">Within SLA</span></td>
            <td class="text-sm text-gray-500">{{ formatDate(ticket.updatedAt) }}</td>
            <td class="text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination">
        <div class="pagination-info">Showing 1 to {{ filteredTickets.length }} of {{ filteredTickets.length }} tickets</div>
        <div class="pagination-controls">
          <button class="pagination-btn" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="15 18 9 12 15 6"/></svg></button>
          <button class="pagination-btn active">1</button>
          <button class="pagination-btn">2</button>
          <button class="pagination-btn">3</button>
          <button class="pagination-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>
    </div>
  </div>
</template>
