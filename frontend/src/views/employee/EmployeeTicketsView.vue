<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useTicketStore } from '../../stores/ticket'
import { useAuthStore } from '../../stores/auth'
import { useCategoryStore } from '../../stores/category'
import { Plus, Search, ChevronRight } from 'lucide-vue-next'
import PriorityBadge from '../../components/common/PriorityBadge.vue'
import { formatDistanceToNow } from 'date-fns'

const ticketStore = useTicketStore()
const authStore = useAuthStore()
const categoryStore = useCategoryStore()

const user = computed(() => authStore.user)
const tickets = computed(() => ticketStore.tickets.filter(t => t.requesterId === user.value?.id))

const activeTab = ref('all')
const searchQuery = ref('')
const statusFilter = ref('All Status')
const priorityFilter = ref('All Priority')
const categoryFilter = ref('All Categories')

onMounted(async () => {
  if (user.value) {
    await Promise.all([
      ticketStore.fetchMyTickets(user.value.id),
      categoryStore.fetchCategories()
    ])
  }
})

const filteredTickets = computed(() => {
  let result = tickets.value

  // Tabs
  if (activeTab.value === 'open') {
    result = result.filter(t => t.status === 'Open')
  } else if (activeTab.value === 'inprogress') {
    result = result.filter(t => t.status === 'In Progress')
  } else if (activeTab.value === 'pending') {
    result = result.filter(t => t.status === 'Pending')
  } else if (activeTab.value === 'resolved') {
    result = result.filter(t => t.status === 'Resolved' || t.status === 'Closed')
  }

  // Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(t => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
  }

  // Filters (mock logic for dropdowns)
  if (statusFilter.value !== 'All Status') {
    result = result.filter(t => t.status === statusFilter.value)
  }
  if (priorityFilter.value !== 'All Priority') {
    result = result.filter(t => t.priority === priorityFilter.value)
  }
  if (categoryFilter.value !== 'All Categories') {
    result = result.filter(t => getCategoryName(t.categoryId) === categoryFilter.value)
  }

  return result
})

const counts = computed(() => {
  const all = tickets.value.length
  const open = tickets.value.filter(t => t.status === 'Open').length
  const inprogress = tickets.value.filter(t => t.status === 'In Progress').length
  const pending = tickets.value.filter(t => t.status === 'Pending').length
  const resolved = tickets.value.filter(t => t.status === 'Resolved' || t.status === 'Closed').length
  return { all, open, inprogress, pending, resolved }
})

const getCategoryName = (id: string) => {
  const cat = categoryStore.categories.find(c => c.id === id)
  return cat ? cat.name : 'Uncategorized'
}

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

const formatCreatedDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

const formatTimeAgo = (dateStr: string) => {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8 animate-slide-up">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 mb-1">My Tickets</h1>
        <p class="text-gray-500 text-[15px]">View and track all your support requests.</p>
      </div>
      <router-link :to="{ name: 'employee.ticket.create' }" class="btn btn-primary h-9 px-4 text-sm">
        <Plus :size="16" class="mr-2" />
        Create Ticket
      </router-link>
    </div>

    <!-- Filters -->
    <div class="card card-no-hover mb-6 animate-slide-up">
      <div class="card-body-compact flex items-center gap-4 flex-wrap">
        <div class="relative flex-1 min-w-[200px]">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" v-model="searchQuery" class="form-input" style="padding-left:36px;height:38px;" placeholder="Search tickets...">
        </div>
        <select v-model="statusFilter" class="form-select" style="width:150px;height:38px;font-size:13px;">
          <option>All Status</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Pending</option>
          <option>Resolved</option>
          <option>Closed</option>
        </select>
        <select v-model="priorityFilter" class="form-select" style="width:150px;height:38px;font-size:13px;">
          <option>All Priority</option>
          <option>Urgent</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <select v-model="categoryFilter" class="form-select" style="width:160px;height:38px;font-size:13px;">
          <option>All Categories</option>
          <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
        </select>
      </div>
    </div>

    <!-- Tabs and Table -->
    <div class="table-container animate-slide-up">
      <div class="table-tabs">
        <button class="table-tab" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
          All Tickets <span class="ml-1.5 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium" :class="activeTab === 'all' ? 'bg-blue-50 text-blue-600' : ''">{{ counts.all }}</span>
        </button>
        <button class="table-tab" :class="{ active: activeTab === 'open' }" @click="activeTab = 'open'">
          Open <span class="ml-1.5 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium" :class="activeTab === 'open' ? 'bg-blue-50 text-blue-600' : ''">{{ counts.open }}</span>
        </button>
        <button class="table-tab" :class="{ active: activeTab === 'inprogress' }" @click="activeTab = 'inprogress'">
          In Progress <span class="ml-1.5 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium" :class="activeTab === 'inprogress' ? 'bg-blue-50 text-blue-600' : ''">{{ counts.inprogress }}</span>
        </button>
        <button class="table-tab" :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">
          Pending <span class="ml-1.5 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium" :class="activeTab === 'pending' ? 'bg-blue-50 text-blue-600' : ''">{{ counts.pending }}</span>
        </button>
        <button class="table-tab" :class="{ active: activeTab === 'resolved' }" @click="activeTab = 'resolved'">
          Resolved <span class="ml-1.5 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium" :class="activeTab === 'resolved' ? 'bg-blue-50 text-blue-600' : ''">{{ counts.resolved }}</span>
        </button>
      </div>

      <div class="overflow-x-auto">
        <table v-if="filteredTickets.length > 0">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Subject</th>
              <th>Category</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created</th>
              <th>Last Update</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in filteredTickets" :key="ticket.id" class="hover:bg-gray-50/50 transition-colors">
              <td><router-link :to="{ name: 'employee.ticket.detail', params: { id: ticket.id } }" class="table-ticket-id">#{{ ticket.id }}</router-link></td>
              <td class="font-medium text-gray-900">{{ ticket.title }}</td>
              <td class="text-sm text-gray-500">{{ getCategoryName(ticket.categoryId) }}</td>
              <td><span class="badge" :class="getStatusClass(ticket.status)">{{ ticket.status }}</span></td>
              <td><PriorityBadge :priority="ticket.priority" /></td>
              <td class="text-sm text-gray-500">{{ formatCreatedDate(ticket.createdAt) }}</td>
              <td class="text-sm text-gray-500">{{ formatTimeAgo(ticket.updatedAt) }}</td>
              <td>
                <router-link :to="{ name: 'employee.ticket.detail', params: { id: ticket.id } }" class="text-gray-400 hover:text-gray-600">
                  <ChevronRight :size="16" />
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-else class="text-center py-16">
          <p class="text-gray-500 mb-2">No tickets match your filters.</p>
          <button v-if="searchQuery || statusFilter !== 'All Status' || priorityFilter !== 'All Priority' || categoryFilter !== 'All Categories'" 
                  @click="searchQuery = ''; statusFilter = 'All Status'; priorityFilter = 'All Priority'; categoryFilter = 'All Categories'"
                  class="text-blue-600 text-sm font-medium hover:underline">
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
