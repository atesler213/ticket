<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { useTicketStore } from '../../stores/ticket'
import { useAssetStore } from '../../stores/asset'

const userStore = useUserStore()
const ticketStore = useTicketStore()
const assetStore = useAssetStore()

onMounted(async () => {
  await Promise.all([
    userStore.fetchUsers(),
    ticketStore.fetchAllTickets(),
    assetStore.fetchAssets()
  ])
})
</script>

<template>
  <div>
    <!-- Quick Actions -->
    <div class="flex justify-between items-center mb-6 animate-slide-up">
      <h2 class="text-lg font-semibold text-gray-900">System Overview</h2>
      <div class="flex gap-3">
        <button class="btn btn-secondary btn-sm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Security Scan</button>
        <button class="btn btn-primary btn-sm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Invite Users</button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-4 gap-5 mb-6 stagger">
      <div class="kpi-card animate-slide-up">
        <div class="kpi-icon kpi-icon-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <div class="kpi-info"><div class="kpi-label">Active Users</div><div class="kpi-value">{{ userStore.users.length }}</div><div class="kpi-trend kpi-trend-up">Total accounts</div></div>
      </div>
      <div class="kpi-card animate-slide-up">
        <div class="kpi-icon kpi-icon-green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
        <div class="kpi-info"><div class="kpi-label">Total Assets</div><div class="kpi-value">{{ assetStore.assets.length }}</div><div class="kpi-trend kpi-trend-up">Managed devices</div></div>
      </div>
      <div class="kpi-card animate-slide-up">
        <div class="kpi-icon kpi-icon-purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
        <div class="kpi-info"><div class="kpi-label">Active Agents</div><div class="kpi-value">{{ userStore.users.filter(u => u.role.includes('Agent')).length }} / {{ userStore.users.length }}</div><div class="text-xs text-gray-500 mt-1">Ready for assignment</div></div>
      </div>
      <div class="kpi-card animate-slide-up">
        <div class="kpi-icon kpi-icon-orange"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
        <div class="kpi-info"><div class="kpi-label">System Uptime</div><div class="kpi-value">99.9%</div><div class="kpi-trend kpi-trend-up">Last 30 days</div></div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <!-- License Usage -->
      <div class="card card-no-hover animate-slide-up">
        <div class="card-header" style="padding:16px 20px;">
          <h3 class="text-[15px] font-semibold text-gray-900">License Usage</h3>
          <a href="#" class="text-sm font-medium text-blue-600">Manage Licenses</a>
        </div>
        <div class="card-body" style="padding:20px;">
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-1"><span class="font-medium text-gray-700">Agent Licenses</span><span class="text-gray-500">15 / 20 Used</span></div>
              <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-blue-600 h-2 rounded-full" style="width: 75%"></div></div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1"><span class="font-medium text-gray-700">Admin Licenses</span><span class="text-gray-500">3 / 5 Used</span></div>
              <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-indigo-600 h-2 rounded-full" style="width: 60%"></div></div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1"><span class="font-medium text-gray-700">Storage Capacity</span><span class="text-gray-500">450 GB / 1 TB</span></div>
              <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-green-500 h-2 rounded-full" style="width: 45%"></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Status -->
      <div class="card card-no-hover animate-slide-up">
        <div class="card-header" style="padding:16px 20px;">
          <h3 class="text-[15px] font-semibold text-gray-900">System Integrations</h3>
          <router-link :to="{ name: 'admin.settings' }" class="text-sm font-medium text-blue-600">View All</router-link>
        </div>
        <div class="card-body" style="padding:8px 20px 16px;">
          <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded bg-gray-100 flex items-center justify-center font-bold text-gray-600">AD</div>
              <div><div class="text-sm font-medium text-gray-900">Active Directory</div><div class="text-xs text-gray-500">User Sync</div></div>
            </div>
            <span class="badge badge-active text-xs">Connected</span>
          </div>
          <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded bg-gray-100 flex items-center justify-center font-bold text-blue-600">J</div>
              <div><div class="text-sm font-medium text-gray-900">Jira Software</div><div class="text-xs text-gray-500">Issue Tracking</div></div>
            </div>
            <span class="badge badge-active text-xs">Connected</span>
          </div>
          <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded bg-gray-100 flex items-center justify-center font-bold text-indigo-600">S</div>
              <div><div class="text-sm font-medium text-gray-900">Slack</div><div class="text-xs text-gray-500">Notifications</div></div>
            </div>
            <span class="badge badge-inactive text-xs text-red-600 bg-red-50">Error</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
