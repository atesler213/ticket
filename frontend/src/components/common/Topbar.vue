<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

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
      
      <div class="topbar-profile">
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
      </div>
    </div>
  </header>
</template>
