<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useTicketStore } from '../../stores/ticket'
import { useAuthStore } from '../../stores/auth'
import KpiCard from '../../components/common/KpiCard.vue'
import TicketList from '../../components/ticket/TicketList.vue'
import { Monitor, LifeBuoy, Zap } from 'lucide-vue-next'

const ticketStore = useTicketStore()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const tickets = computed(() => ticketStore.tickets)

onMounted(() => {
  if (user.value) {
    ticketStore.fetchMyTickets(user.value.id)
  }
})
</script>

<template>
  <div>
    <!-- Welcome Section -->
    <div class="flex justify-between items-center mb-8 animate-slide-up">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Good morning, {{ user?.name.split(' ')[0] }}</h1>
        <p class="text-gray-500 mt-1">Here is what's happening with your IT requests today.</p>
      </div>
      <button class="btn btn-primary h-10 px-5">
        <Zap :size="16" class="mr-2" />
        New Request
      </button>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-3 gap-6 mb-8 stagger">
      <div class="card p-6 flex items-start gap-4 cursor-pointer group">
        <div class="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <Monitor :size="24" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Request Hardware</h3>
          <p class="text-sm text-gray-500 mt-1">Laptops, monitors, phones</p>
        </div>
      </div>
      
      <div class="card p-6 flex items-start gap-4 cursor-pointer group">
        <div class="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
          <LifeBuoy :size="24" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Software Access</h3>
          <p class="text-sm text-gray-500 mt-1">Licenses, accounts, VPN</p>
        </div>
      </div>

      <KpiCard title="My Active Tickets" :value="tickets.length" />
    </div>

    <!-- Recent Tickets -->
    <div class="card card-no-hover animate-slide-up" style="animation-delay: 100ms;">
      <div class="card-header border-b border-gray-100 flex justify-between items-center" style="padding: 20px 24px;">
        <h3 class="text-lg font-semibold text-gray-900">Recent Tickets</h3>
        <button class="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
      </div>
      
      <div class="card-body p-0">
        <div v-if="ticketStore.isLoading" class="p-8 text-center text-gray-400">Loading tickets...</div>
        <TicketList v-else :tickets="tickets" />
      </div>
    </div>
  </div>
</template>
