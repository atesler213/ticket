<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)
const isProfileMenuOpen = ref(false)
const selectedDateFilter = ref('this_week')
const customStartDate = ref('')
const customEndDate = ref('')

const isAdminDashboard = computed(() => route.name === 'admin.dashboard')

function toggleProfileMenu() {
  isProfileMenuOpen.value = !isProfileMenuOpen.value
}

function closeProfileMenu() {
  isProfileMenuOpen.value = false
}

async function handleLogout() {
  authStore.logout()
  closeProfileMenu()
  await router.push({ name: 'login' })
}

function onDocumentClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (!target?.closest('.topbar-profile-wrapper')) {
    closeProfileMenu()
  }
}

function emitDashboardDateFilter() {
  window.dispatchEvent(new CustomEvent('admin-dashboard-date-filter-change', {
    detail: {
      preset: selectedDateFilter.value,
      startDate: customStartDate.value || null,
      endDate: customEndDate.value || null
    }
  }))
}

function openCreateTicketModal() {
  window.dispatchEvent(new CustomEvent('admin-dashboard-create-ticket'))
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  if (isAdminDashboard.value) {
    emitDashboardDateFilter()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})

watch(isAdminDashboard, (value) => {
  if (value) {
    emitDashboardDateFilter()
  }
})

watch([selectedDateFilter, customStartDate, customEndDate], () => {
  if (isAdminDashboard.value) {
    emitDashboardDateFilter()
  }
})

const pageTitle = computed(() => {
  if (route.meta?.title) return route.meta.title as string
  if (route.name === 'agent.dashboard') return 'IT Support Dashboard'
  if (route.name === 'employee.dashboard') return 'Employee Portal'
  if (route.name === 'admin.dashboard') return 'Admin Dashboard'
  if (route.name === 'admin.reports') return 'Executive Reports'
  if (route.name === 'admin.slas') return 'SLA Policies'
  if (route.name === 'admin.tickets') return 'All Tickets'
  if (route.name === 'admin.users') return 'User Management'
  if (route.name === 'admin.roles') return 'Roles & Permissions'
  if (route.name === 'admin.assets') return 'Asset Management'
  if (route.name === 'admin.departments') return 'Departments'
  if (route.name === 'admin.categories') return 'Categories'
  if (route.name === 'admin.settings') return 'System Settings'
  return 'IT Support Dashboard'
})
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <button class="topbar-hamburger" style="display:flex;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div class="topbar-title">{{ pageTitle }}</div>
    </div>
    
    <div class="topbar-center">
      <div class="topbar-search">
        <svg class="topbar-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Search tickets, users, assets...">
        <span class="topbar-search-shortcut">⌘ K</span>
      </div>
    </div>
    
    <div class="topbar-right">
      <template v-if="isAdminDashboard">
        <select v-model="selectedDateFilter" class="form-select" style="width: 140px; height: 34px; font-size: 12px; margin-right: 8px;">
          <option value="today">Today</option>
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
          <option value="custom_range">Custom Range</option>
        </select>
        <template v-if="selectedDateFilter === 'custom_range'">
          <input v-model="customStartDate" type="date" class="form-input" style="width: 132px; height: 34px; font-size: 12px; margin-right: 6px;" />
          <input v-model="customEndDate" type="date" class="form-input" style="width: 132px; height: 34px; font-size: 12px; margin-right: 8px;" />
        </template>
        <button class="btn btn-primary btn-sm" @click="openCreateTicketModal" style="height: 34px; margin-right: 10px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Ticket
        </button>
      </template>

      <button class="topbar-icon-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span class="badge" style="background:var(--primary-600);">5</span>
      </button>
      
      <button class="topbar-icon-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
      
      <div class="topbar-divider"></div>
      
      <div class="topbar-profile-wrapper" style="position: relative;">
        <button class="topbar-profile" type="button" @click="toggleProfileMenu">
          <img 
            :src="user?.avatar || 'https://ui-avatars.com/api/?name=Michael+Smith&background=10B981&color=fff&size=36&rounded=true&bold=true'" 
            alt="MS" 
            class="topbar-profile-avatar"
          >
          <div class="topbar-profile-info">
            <div class="topbar-profile-name">{{ user?.name || 'Michael Smith' }}</div>
            <div class="topbar-profile-role">{{ user?.role || 'IT Support Agent' }}</div>
          </div>
          <svg class="topbar-profile-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <div
          v-if="isProfileMenuOpen"
          style="
            position: absolute;
            right: 0;
            top: calc(100% + 8px);
            width: 220px;
            background: #fff;
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
            z-index: 100;
            overflow: hidden;
          "
        >
          <div style="padding: 12px 14px; border-bottom: 1px solid #F1F5F9;">
            <div style="font-size: 13px; font-weight: 700; color: #0F172A;">{{ user?.name || 'User' }}</div>
            <div style="font-size: 12px; color: #64748B; margin-top: 2px;">{{ user?.email || '' }}</div>
          </div>
          <button
            type="button"
            @click="handleLogout"
            style="
              width: 100%;
              text-align: left;
              padding: 10px 14px;
              font-size: 13px;
              font-weight: 600;
              color: #B91C1C;
              background: #fff;
              border: none;
              cursor: pointer;
            "
            @mouseover="($event.currentTarget as HTMLElement).style.background = '#FEF2F2'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background = '#fff'"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
