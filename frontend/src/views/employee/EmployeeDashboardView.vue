<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useTicketStore } from '../../stores/ticket'
import { useCategoryStore } from '../../stores/category'
import { ShieldCheck, Monitor, HelpCircle, MonitorSmartphone, Shield, Wifi, FileText, ChevronRight } from 'lucide-vue-next'
import PriorityBadge from '../../components/common/PriorityBadge.vue'

const authStore = useAuthStore()
const ticketStore = useTicketStore()
const categoryStore = useCategoryStore()

onMounted(async () => {
  if (authStore.user) {
    await Promise.all([
      ticketStore.fetchMyTickets(authStore.user.id),
      categoryStore.fetchCategories()
    ])
  }
})

const activeTickets = computed(() => {
  return ticketStore.tickets
    .filter(t => t.requesterId === authStore.user?.id && t.status !== 'Closed' && t.status !== 'Resolved')
    .slice(0, 5) // Show top 5
})

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Open': return 'badge-open'
    case 'In Progress': return 'badge-inprogress'
    case 'Pending': return 'badge-pending'
    case 'Resolved': return 'badge-resolved'
    case 'Closed': return 'badge-resolved'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br>${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
}

const getCategoryName = (id: string) => {
  const cat = categoryStore.categories.find(c => c.id === id)
  return cat ? cat.name : 'Uncategorized'
}
</script>

<template>
  <div>
    <!-- Welcome Section -->
    <div class="mb-8 animate-slide-up">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">Welcome back, {{ authStore.user?.name.split(' ')[0] || 'User' }}! 👋</h1>
      <p class="text-gray-500 text-[15px]">How can we help you today?</p>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 stagger">
      <!-- Report an Issue -->
      <router-link :to="{ name: 'employee.tickets.create' }" class="action-card animate-slide-up cursor-pointer">
        <div class="action-card-icon action-card-icon-blue">
          <Monitor :size="24" />
        </div>
        <div class="action-card-content">
          <div class="action-card-title">Report an Issue</div>
          <div class="action-card-desc">Submit an IT issue and get help from our team</div>
        </div>
        <ChevronRight :size="24" class="action-card-arrow" />
      </router-link>

      <!-- Request Hardware/Software -->
      <router-link :to="{ name: 'employee.tickets.create' }" class="action-card animate-slide-up cursor-pointer">
        <div class="action-card-icon action-card-icon-green">
          <MonitorSmartphone :size="24" />
        </div>
        <div class="action-card-content">
          <div class="action-card-title">Request Hardware / Software</div>
          <div class="action-card-desc">Request new hardware or software</div>
        </div>
        <ChevronRight :size="24" class="action-card-arrow" />
      </router-link>

      <!-- Knowledgebase / FAQ -->
      <router-link :to="{ name: 'employee.tickets' }" class="action-card animate-slide-up cursor-pointer">
        <div class="action-card-icon action-card-icon-purple">
          <FileText :size="24" />
        </div>
        <div class="action-card-content">
          <div class="action-card-title">Knowledgebase / FAQ</div>
          <div class="action-card-desc">Find answers to common questions</div>
        </div>
        <ChevronRight :size="24" class="action-card-arrow" />
      </router-link>
    </div>

    <!-- Main Grid: Tickets + Right Sidebar -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

      <!-- Left: Active Tickets & KB -->
      <div class="col-span-1 lg:col-span-9">
        
        <!-- My Active Tickets -->
        <div class="table-container mb-6 animate-slide-up">
          <div class="table-header">
            <h2 class="table-title">My Active Tickets</h2>
            <router-link :to="{ name: 'employee.tickets' }" class="table-link">View All Tickets</router-link>
          </div>
          <div class="overflow-x-auto">
            <table v-if="activeTickets.length > 0">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Last Update</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ticket in activeTickets" :key="ticket.id">
                  <td><router-link :to="{ name: 'employee.ticket.detail', params: { id: ticket.id } }" class="table-ticket-id">#{{ ticket.id }}</router-link></td>
                  <td class="font-medium text-gray-900">{{ ticket.title }}</td>
                  <td class="text-gray-500">{{ getCategoryName(ticket.categoryId) }}</td>
                  <td><span class="badge" :class="getStatusClass(ticket.status)">{{ ticket.status }}</span></td>
                  <td><PriorityBadge :priority="ticket.priority" /></td>
                  <td class="text-gray-500 text-sm" v-html="formatDate(ticket.updatedAt)"></td>
                  <td class="text-gray-400">
                    <router-link :to="{ name: 'employee.ticket.detail', params: { id: ticket.id } }">
                      <ChevronRight :size="16" />
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="text-center py-8 text-gray-500 text-sm">
              You have no active tickets.
            </div>
          </div>
        </div>

        <!-- Knowledgebase Section -->
        <div class="animate-slide-up" style="animation-delay: 50ms;">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-lg font-semibold text-gray-900">Knowledgebase</h2>
            <router-link :to="{ name: 'employee.tickets' }" class="table-link">View All Articles</router-link>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div class="kb-category-card cursor-pointer">
              <div class="kb-category-icon" style="background: var(--primary-50); color: var(--primary-600);">
                <HelpCircle :size="24" />
              </div>
              <div class="kb-category-title">Getting Started</div>
              <div class="kb-category-desc">New to the portal? Learn the basics.</div>
            </div>
            <div class="kb-category-card cursor-pointer">
              <div class="kb-category-icon" style="background: var(--success-50); color: var(--success-600);">
                <ShieldCheck :size="24" />
              </div>
              <div class="kb-category-title">Account & Access</div>
              <div class="kb-category-desc">Manage your account and access issues.</div>
            </div>
            <div class="kb-category-card cursor-pointer">
              <div class="kb-category-icon" style="background: var(--warning-50); color: var(--warning-600);">
                <Wifi :size="24" />
              </div>
              <div class="kb-category-title">Network & VPN</div>
              <div class="kb-category-desc">Find solutions for network problems.</div>
            </div>
            <div class="kb-category-card cursor-pointer">
              <div class="kb-category-icon" style="background: var(--danger-50); color: var(--danger-600);">
                <Shield :size="24" />
              </div>
              <div class="kb-category-title">Security</div>
              <div class="kb-category-desc">Security tips and best practices.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Sidebar -->
      <div class="col-span-1 lg:col-span-3">
        <!-- My Assigned Assets -->
        <div class="card card-no-hover mb-6 animate-slide-up">
          <div class="card-header" style="padding: 16px 20px;">
            <h3 class="text-[15px] font-semibold text-gray-900">My Assigned Assets</h3>
            <a href="#" class="text-sm font-medium text-blue-600 hover:text-blue-700">View All</a>
          </div>
          <div class="card-body" style="padding: 12px 20px;">
            <div class="asset-item">
              <div class="asset-icon">
                <Monitor :size="20" />
              </div>
              <div class="asset-info">
                <div class="asset-name">MacBook Pro 16"</div>
                <div class="asset-serial">Serial: CO2F66XYZ123</div>
              </div>
            </div>
            <div class="asset-item">
              <div class="asset-icon">
                <Monitor :size="20" />
              </div>
              <div class="asset-info">
                <div class="asset-name">Dell 27 Monitor</div>
                <div class="asset-serial">Serial: DELL27-8HJ2JD</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Announcements -->
        <div class="card card-no-hover animate-slide-up" style="animation-delay: 50ms;">
          <div class="card-header" style="padding: 16px 20px;">
            <h3 class="text-[15px] font-semibold text-gray-900">Announcements</h3>
            <a href="#" class="text-sm font-medium text-blue-600 hover:text-blue-700">View All</a>
          </div>
          <div class="card-body" style="padding: 12px 20px;">
            <div class="announcement-item">
              <div class="announcement-dot" style="background: var(--success-500);"></div>
              <div class="announcement-content">
                <div class="announcement-title">VPN Maintenance</div>
                <div class="announcement-text">Scheduled maintenance this Sunday.</div>
                <div class="announcement-date">Today</div>
              </div>
            </div>
            <div class="announcement-item">
              <div class="announcement-dot" style="background: var(--primary-500);"></div>
              <div class="announcement-content">
                <div class="announcement-title">Security Policy</div>
                <div class="announcement-text">Please review the updated policy.</div>
                <div class="announcement-date">Yesterday</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
