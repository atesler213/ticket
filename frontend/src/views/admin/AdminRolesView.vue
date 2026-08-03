<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoleStore } from '../../stores/role'
import SlideOver from '../../components/admin/SlideOver.vue'
import type { Role } from '../../types/Role'

const roleStore = useRoleStore()

onMounted(async () => {
  await roleStore.fetchRoles()
})

const showForm = ref(false)
const isEditing = ref(false)
const currentRoleId = ref('')

const formData = ref<Partial<Role>>({
  name: '',
  description: '',
  permissions: []
})

const availablePermissions: string[] = [
  'view_tickets', 'create_tickets', 'edit_tickets', 'delete_tickets',
  'manage_users', 'manage_roles', 'manage_departments', 'manage_settings'
]

const permIcons: Record<string, string> = {
  view_tickets: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  create_tickets: 'M12 5v14M5 12h14',
  edit_tickets: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  delete_tickets: 'M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6',
  manage_users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  manage_roles: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  manage_departments: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  manage_settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
}

function formatPermLabel(perm: string) {
  return perm.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
}

function openCreate() {
  isEditing.value = false
  currentRoleId.value = ''
  formData.value = { name: '', description: '', permissions: [] }
  showForm.value = true
}

function openEdit(role: Role) {
  isEditing.value = true
  currentRoleId.value = role.id
  formData.value = { ...role, permissions: [...(role.permissions || [])] }
  showForm.value = true
}

async function handleSave() {
  if (isEditing.value) {
    await roleStore.updateRole(currentRoleId.value, formData.value)
  } else {
    await roleStore.createRole(formData.value)
  }
  showForm.value = false
}

const roleCards = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all settings, users, tickets, and billing.',
    iconColor: '#4F46E5',
    iconBg: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
    iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    userCount: '3 Users',
    permissions: [
      { label: 'Manage System Settings', granted: true },
      { label: 'Manage Users & Roles', granted: true },
      { label: 'Manage All Tickets', granted: true },
    ],
    storeIndex: 0,
    defaultRole: { id: 'admin', name: 'Administrator', isSystem: true }
  },
  {
    id: 'agent',
    name: 'Support Agent',
    description: 'Can view and manage tickets, assets, and knowledgebase.',
    iconColor: '#059669',
    iconBg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
    iconPath: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z',
    userCount: '12 Users',
    permissions: [
      { label: 'Manage System Settings', granted: false },
      { label: 'Read-only Users Directory', granted: true },
      { label: 'Manage Assigned/Queue Tickets', granted: true },
    ],
    storeIndex: 1,
    defaultRole: { id: 'agent', name: 'Support Agent', isSystem: true }
  },
  {
    id: 'employee',
    name: 'Employee',
    description: 'Standard user. Can only create and view their own tickets.',
    iconColor: '#64748B',
    iconBg: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
    iconPath: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    userCount: '1,230 Users',
    permissions: [
      { label: 'Manage System Settings', granted: false },
      { label: 'Manage Users & Roles', granted: false },
      { label: 'View Own Tickets Only', granted: true },
    ],
    storeIndex: 2,
    defaultRole: { id: 'employee', name: 'Employee', isSystem: true }
  }
]
</script>

<template>
  <div>
    <!-- Page Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;" class="animate-slide-up">
      <p style="font-size: 13px; color: #64748B; margin: 0;">Manage what users can see and do within the portal.</p>
      <button
        class="btn btn-primary btn-sm"
        @click="openCreate"
        style="display: inline-flex; align-items: center; gap: 6px;"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Create Custom Role
      </button>
    </div>

    <!-- Role Cards -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;" class="stagger">
      <div
        v-for="card in roleCards"
        :key="card.id"
        class="animate-slide-up"
        style="
          background: #fff;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 1px 4px rgba(15,23,42,0.05);
          overflow: hidden;
          transition: box-shadow 0.2s, transform 0.2s;
          cursor: default;
        "
        @mouseover="($event.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(15,23,42,0.10)'; ($event.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'"
        @mouseleave="($event.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(15,23,42,0.05)'; ($event.currentTarget as HTMLElement).style.transform = 'translateY(0)'"
      >
        <!-- Card Body -->
        <div style="padding: 20px 20px 16px 20px;">
          <!-- Icon + Badge Row -->
          <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px;">
            <div :style="`
              width: 40px; height: 40px;
              border-radius: 10px;
              background: ${card.iconBg};
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            `">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="card.iconColor" stroke-width="2">
                <path :d="card.iconPath"/>
              </svg>
            </div>
            <span style="
              font-size: 11px;
              font-weight: 600;
              color: #4F46E5;
              background: #EEF2FF;
              padding: 3px 10px;
              border-radius: 999px;
              letter-spacing: 0.02em;
            ">System Role</span>
          </div>

          <!-- Title + Description -->
          <h3 style="font-size: 15px; font-weight: 700; color: #0F172A; margin: 0 0 6px 0;">{{ card.name }}</h3>
          <p style="font-size: 13px; color: #64748B; margin: 0 0 16px 0; line-height: 1.5; min-height: 40px;">{{ card.description }}</p>

          <!-- Permissions List -->
          <div style="border-top: 1px solid #F1F5F9; padding-top: 14px; margin-bottom: 14px;">
            <div
              v-for="perm in card.permissions"
              :key="perm.label"
              style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 13px;"
            >
              <div v-if="perm.granted" style="width: 16px; height: 16px; border-radius: 50%; background: #ECFDF5; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div v-else style="width: 16px; height: 16px; border-radius: 50%; background: #FEF2F2; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
              <span :style="perm.granted ? 'color: #334155;' : 'color: #94A3B8; text-decoration: line-through;'">{{ perm.label }}</span>
            </div>
          </div>

          <!-- Footer: Users + Edit Button -->
          <div style="
            border-top: 1px solid #F1F5F9;
            padding-top: 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          ">
            <div style="display: flex; align-items: center; gap: 6px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span style="font-size: 13px; font-weight: 600; color: #475569;">{{ card.userCount }}</span>
            </div>
            <button
              style="
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                font-size: 12px;
                font-weight: 600;
                color: #334155;
                background: #F8FAFC;
                border: 1px solid #E2E8F0;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.15s;
              "
              @mouseover="($event.currentTarget as HTMLElement).style.background = '#EEF2FF'; ($event.currentTarget as HTMLElement).style.color = '#4F46E5'; ($event.currentTarget as HTMLElement).style.borderColor = '#C7D2FE'"
              @mouseleave="($event.currentTarget as HTMLElement).style.background = '#F8FAFC'; ($event.currentTarget as HTMLElement).style.color = '#334155'; ($event.currentTarget as HTMLElement).style.borderColor = '#E2E8F0'"
              @click="openEdit(roleStore.roles[card.storeIndex] || (card.defaultRole as Role))"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Role
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Role Slide-Over -->
    <SlideOver :show="showForm" :title="isEditing ? 'Edit Role' : 'Create Custom Role'" @close="showForm = false">
      <template #content>
        <div style="display: flex; flex-direction: column; gap: 24px;">

          <!-- Role Name -->
          <div>
            <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">Role Name</label>
            <input
              type="text"
              v-model="formData.name"
              :disabled="formData.isSystem"
              placeholder="e.g. Content Editor"
              style="
                width: 100%;
                padding: 10px 14px;
                font-size: 14px;
                font-weight: 500;
                color: #0F172A;
                background: #fff;
                border: 1.5px solid #E2E8F0;
                border-radius: 8px;
                outline: none;
                transition: border-color 0.15s, box-shadow 0.15s;
                box-sizing: border-box;
              "
              @focus="($event.target as HTMLElement).style.borderColor = '#6366F1'; ($event.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'"
              @blur="($event.target as HTMLElement).style.borderColor = '#E2E8F0'; ($event.target as HTMLElement).style.boxShadow = 'none'"
            >
            <p style="font-size: 12px; color: #94A3B8; margin: 6px 0 0 0;">A unique, descriptive name for this role.</p>
            <div v-if="formData.isSystem" style="
              display: flex; align-items: center; gap: 8px;
              padding: 10px 12px;
              background: #FFFBEB;
              border: 1px solid #FCD34D;
              border-radius: 8px;
              margin-top: 8px;
              font-size: 12px;
              font-weight: 500;
              color: #92400E;
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              System role names cannot be changed.
            </div>
          </div>

          <!-- Description -->
          <div>
            <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">Description</label>
            <textarea
              v-model="formData.description"
              rows="3"
              placeholder="Describe what users with this role can access..."
              style="
                width: 100%;
                padding: 10px 14px;
                font-size: 14px;
                color: #334155;
                background: #fff;
                border: 1.5px solid #E2E8F0;
                border-radius: 8px;
                outline: none;
                resize: vertical;
                font-family: inherit;
                line-height: 1.5;
                transition: border-color 0.15s, box-shadow 0.15s;
                box-sizing: border-box;
              "
              @focus="($event.target as HTMLElement).style.borderColor = '#6366F1'; ($event.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'"
              @blur="($event.target as HTMLElement).style.borderColor = '#E2E8F0'; ($event.target as HTMLElement).style.boxShadow = 'none'"
            ></textarea>
            <p style="font-size: 12px; color: #94A3B8; margin: 6px 0 0 0;">Brief summary of access scope and responsibilities.</p>
          </div>

          <!-- Permissions -->
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #F1F5F9; padding-bottom: 10px; margin-bottom: 12px;">
              <label style="font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em;">Permissions</label>
              <span style="
                font-size: 11px;
                font-weight: 700;
                color: #6366F1;
                background: #EEF2FF;
                padding: 3px 10px;
                border-radius: 999px;
              ">{{ formData.permissions?.length || 0 }} Selected</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; padding-right: 2px;">
              <label
                v-for="perm in availablePermissions"
                :key="perm"
                :style="`
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  padding: 12px 14px;
                  border-radius: 10px;
                  border: 1.5px solid ${formData.permissions?.includes(perm) ? '#6366F1' : '#E2E8F0'};
                  background: ${formData.permissions?.includes(perm) ? '#F5F3FF' : '#fff'};
                  cursor: pointer;
                  transition: all 0.15s;
                  user-select: none;
                `"
                @mouseover="if(!formData.permissions?.includes(perm)) { ($event.currentTarget as HTMLElement).style.borderColor = '#C7D2FE'; ($event.currentTarget as HTMLElement).style.background = '#FAFAFA'; }"
                @mouseleave="if(!formData.permissions?.includes(perm)) { ($event.currentTarget as HTMLElement).style.borderColor = '#E2E8F0'; ($event.currentTarget as HTMLElement).style.background = '#fff'; }"
              >
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div :style="`
                    width: 36px; height: 36px;
                    border-radius: 8px;
                    background: ${formData.permissions?.includes(perm) ? '#EEF2FF' : '#F8FAFC'};
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                  `">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :stroke="formData.permissions?.includes(perm) ? '#6366F1' : '#94A3B8'" stroke-width="2">
                      <path :d="permIcons[perm] || 'M12 5v14M5 12h14'"/>
                    </svg>
                  </div>
                  <span :style="`font-size: 13px; font-weight: 600; color: ${formData.permissions?.includes(perm) ? '#4338CA' : '#334155'};`">
                    {{ formatPermLabel(perm) }}
                  </span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg v-if="formData.permissions?.includes(perm)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <input
                    type="checkbox"
                    :value="perm"
                    v-model="formData.permissions"
                    style="
                      width: 16px; height: 16px;
                      accent-color: #6366F1;
                      cursor: pointer;
                    "
                  >
                </div>
              </label>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <button
          type="button"
          style="
            padding: 9px 20px;
            font-size: 13px;
            font-weight: 600;
            color: #475569;
            background: #fff;
            border: 1.5px solid #E2E8F0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.15s;
          "
          @mouseover="($event.currentTarget as HTMLElement).style.background = '#F8FAFC'"
          @mouseleave="($event.currentTarget as HTMLElement).style.background = '#fff'"
          @click="showForm = false"
        >
          Cancel
        </button>
        <button
          type="button"
          style="
            padding: 9px 20px;
            font-size: 13px;
            font-weight: 600;
            color: #fff;
            background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
            border: none;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(99,102,241,0.35);
            transition: all 0.15s;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          "
          @mouseover="($event.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(99,102,241,0.45)'; ($event.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(99,102,241,0.35)'; ($event.currentTarget as HTMLElement).style.transform = 'translateY(0)'"
          @click="handleSave"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Save Changes
        </button>
      </template>
    </SlideOver>
  </div>
</template>
