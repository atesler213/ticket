<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useTenantStore } from '../../stores/tenant'
import packageJson from '../../../../package.json'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const tenantStore = useTenantStore()

const tenantConfig = computed(() => tenantStore.company)
const user = computed(() => authStore.user)

const isProfileMenuOpen = ref(false)
const isCollapsed = ref(false)

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

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
  if (isCollapsed.value) {
    document.body.classList.add('sidebar-collapsed')
  } else {
    document.body.classList.remove('sidebar-collapsed')
  }
}

function onDocumentClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (!target?.closest('.sidebar-user-wrapper')) {
    closeProfileMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  // Check initial state if it was collapsed previously, omitted for simplicity
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})

interface NavItem {
  name: string
  icon: string
  route?: string
  target?: { name: string; query?: Record<string, string> }
  badge?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navigationGroups = computed<NavGroup[]>(() => {
  const role = user.value?.role
  const path = route.path

  if (path.startsWith('/admin') || role === 'System Administrator' || role === 'Company Administrator') {
    return [
      {
        label: 'OVERVIEW',
        items: [
          { name: 'Dashboard', route: 'admin.dashboard', icon: 'dashboard' },
          { name: 'Tickets', route: 'admin.tickets', icon: 'tickets' },
          { name: 'Executive Reports', route: 'admin.reports', icon: 'reports' }
        ]
      },
      {
        label: 'USER MANAGEMENT',
        items: [
          { name: 'Users', route: 'admin.users', icon: 'users' },
          { name: 'Roles & Permissions', route: 'admin.roles', icon: 'roles' },
          { name: 'Departments', route: 'admin.departments', icon: 'departments' }
        ]
      },
      {
        label: 'SYSTEM',
        items: [
          { name: 'Asset Management', route: 'admin.assets', icon: 'assets' },
          { name: 'Categories', route: 'admin.categories', icon: 'categories' },
          { name: 'SLA Policies', route: 'admin.slas', icon: 'slas' }
        ]
      },
      {
        label: 'CONFIGURATION',
        items: [
          { name: 'Licenses', route: 'admin.licenses', icon: 'licenses' },
          { name: 'Integrations', route: 'admin.integrations', icon: 'integrations' },
          { name: 'Audit Logs', route: 'admin.audit', icon: 'audit' },
          { name: 'Announcements', route: 'admin.announcements', icon: 'announcements' },
          { name: 'System Settings', route: 'admin.settings', icon: 'settings' }
        ]
      }
    ]
  }

  if (
    path.startsWith('/agent') ||
    role === 'Support Agent' ||
    role === 'IT Support Agent' ||
    role === 'Senior Agent' ||
    role === 'IT Manager' ||
    role === 'CISO / ISB' ||
    role === 'Security Manager'
  ) {
    return [
      {
        label: 'MAIN',
        items: [
          { name: 'Dashboard', route: 'agent.dashboard', icon: 'dashboard' },
          { name: 'All Tickets', target: { name: 'agent.tickets', query: { queue: 'all' } }, icon: 'tickets' },
          { name: 'My Queue', target: { name: 'agent.tickets', query: { queue: 'my' } }, icon: 'queue' },
          { name: 'Unassigned', target: { name: 'agent.tickets', query: { queue: 'unassigned' } }, icon: 'unassigned' },
          { name: 'Overdue', target: { name: 'agent.tickets', query: { queue: 'overdue' } }, icon: 'overdue' }
        ]
      },
      {
        label: 'MANAGEMENT',
        items: [
          { name: 'Users', route: 'admin.users', icon: 'users' },
          { name: 'Assets', route: 'admin.assets', icon: 'assets' },
          { name: 'Departments', route: 'admin.departments', icon: 'departments' },
          { name: 'Knowledgebase', route: 'agent.kb', icon: 'kb' }
        ]
      },
      {
        label: 'REPORTS',
        items: [
          { name: 'Reports', route: 'admin.reports', icon: 'reports' },
          { name: 'Analytics', route: 'admin.reports', icon: 'analytics' }
        ]
      },
      {
        label: 'ADMIN',
        items: [
          { name: 'System Settings', route: 'admin.settings', icon: 'settings' },
          { name: 'Audit Logs', route: 'admin.audit', icon: 'audit' }
        ]
      }
    ]
  }

  // Employee role
  return [
    {
      label: 'PORTAL',
      items: [
        { name: 'Dashboard', route: 'employee.dashboard', icon: 'dashboard' },
        { name: 'My Tickets', route: 'employee.tickets', icon: 'tickets' }
      ]
    },
    {
      label: 'SUPPORT',
      items: [
        { name: 'Knowledgebase', route: 'employee.kb', icon: 'kb' },
        { name: 'System Status', route: 'employee.status', icon: 'analytics' }
      ]
    }
  ]
})

function isActive(item: any) {
  if (item.target) {
    if (route.name !== item.target.name) return false
    
    // Check query params
    if (item.target.query) {
      for (const key in item.target.query) {
        if (route.query[key] !== item.target.query[key]) {
          // Special case: if no queue query param is set, treat 'all' as active
          if (key === 'queue' && item.target.query[key] === 'all' && !route.query.queue) {
            continue;
          }
          return false;
        }
      }
    }
    return true
  }
  return route.name === item.route
}

function navigate(item: any) {
  if (item.target) {
    router.push(item.target)
  } else {
    router.push({ name: item.route })
  }
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="7.5 4.21 12 6.81 16.5 4.21"/>
          <line x1="12" y1="22.08" x2="12" y2="11.73"/>
        </svg>
      </div>
      <div class="sidebar-logo-text">
        <span class="sidebar-logo-title">{{ tenantConfig?.name || 'TechCorp' }}</span>
        <span class="sidebar-logo-subtitle">IT Support Portal</span>
      </div>
    </div>
    
    <nav class="sidebar-nav">
      <div v-for="group in navigationGroups" :key="group.label" class="sidebar-group">
        <div class="sidebar-group-label">{{ group.label }}</div>
        
        <a 
          v-for="item in group.items" 
          :key="item.name"
          href="#"
          @click.prevent="navigate(item)"
          :class="['sidebar-item', { active: isActive(item) }]"
        >
          <!-- Icons strictly matching HTML SVGs -->
          <svg v-if="item.icon === 'dashboard'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <svg v-else-if="item.icon === 'tickets'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          <svg v-else-if="item.icon === 'queue'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          <svg v-else-if="item.icon === 'unassigned'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <svg v-else-if="item.icon === 'overdue'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <svg v-else-if="item.icon === 'users'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <svg v-else-if="item.icon === 'assets'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          <svg v-else-if="item.icon === 'departments'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <svg v-else-if="item.icon === 'kb'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <svg v-else-if="item.icon === 'reports'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          <svg v-else-if="item.icon === 'analytics'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
          <svg v-else-if="item.icon === 'roles'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <svg v-else-if="item.icon === 'categories'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          <svg v-else-if="item.icon === 'slas'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <svg v-else-if="item.icon === 'licenses'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          <svg v-else-if="item.icon === 'integrations'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          <svg v-else-if="item.icon === 'audit'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          <svg v-else-if="item.icon === 'announcements'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4"/></svg>

          {{ item.name }}
          <span v-if="item.badge" class="sidebar-item-badge">{{ item.badge }}</span>
        </a>
      </div>
    </nav>
    
    <div class="sidebar-footer">
      <div class="sidebar-user-wrapper" style="position: relative;">
        <button class="sidebar-user" type="button" @click="toggleProfileMenu" style="width: 100%; border: none; background: transparent; text-align: left; cursor: pointer; padding: 0;">
          <img :src="user?.avatar || 'https://ui-avatars.com/api/?name=Michael+Smith&background=10B981&color=fff&size=36&rounded=true&bold=true'" alt="Avatar" class="sidebar-user-avatar">
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">{{ user?.name || 'Michael Smith' }}</div>
            <div class="sidebar-user-role">{{ user?.role || 'IT Support Agent' }}</div>
            <div class="sidebar-user-status">Online</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        <div
          v-if="isProfileMenuOpen"
          style="
            position: absolute;
            bottom: calc(100% + 8px);
            left: 0;
            width: 220px;
            background: #fff;
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.12);
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
      
      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 12px;">
        <button class="sidebar-collapse-btn" @click="toggleCollapse" style="flex: 1; justify-content: center; margin: 0;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline v-if="!isCollapsed" points="15 18 9 12 15 6"/>
            <polyline v-else points="9 18 15 12 9 6"/>
          </svg>
          <span class="collapse-text">Collapse</span>
        </button>
        <div v-if="!isCollapsed" style="font-size: 11px; color: #94A3B8; font-weight: 600; font-family: monospace; padding-right: 4px;">
          v{{ packageJson.version }}
        </div>
      </div>
    </div>
  </aside>
</template>

<style>
/* Unscoped global CSS overrides for sidebar collapsed state */
body.sidebar-collapsed {
  --sidebar-width: var(--sidebar-collapsed-width, 72px);
}

body.sidebar-collapsed .sidebar-logo-text,
body.sidebar-collapsed .sidebar-group-label,
body.sidebar-collapsed .sidebar-item-badge,
body.sidebar-collapsed .sidebar-user-info,
body.sidebar-collapsed .collapse-text {
  display: none !important;
}

body.sidebar-collapsed .sidebar-item {
  justify-content: center;
  padding: 0;
  width: 44px;
  height: 44px;
  margin: 0 auto 4px auto;
  font-size: 0; /* Hide text content inside anchor */
}

body.sidebar-collapsed .sidebar-item svg {
  margin-right: 0;
}

body.sidebar-collapsed .sidebar-user {
  justify-content: center;
}

body.sidebar-collapsed .sidebar-user > svg {
  display: none;
}

body.sidebar-collapsed .sidebar-collapse-btn {
  justify-content: center;
  padding: 0;
  width: 44px;
  height: 44px;
  margin: 0 auto;
}
body.sidebar-collapsed .sidebar-collapse-btn svg {
  margin-right: 0;
}
</style>
