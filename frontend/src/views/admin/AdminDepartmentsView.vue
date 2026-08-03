<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDepartmentStore } from '../../stores/department'
import { useUserStore } from '../../stores/user'
import SlideOver from '../../components/admin/SlideOver.vue'
import type { Department } from '../../types/Department'

const departmentStore = useDepartmentStore()
const userStore = useUserStore()

onMounted(async () => {
  await Promise.all([
    departmentStore.fetchDepartments(),
    userStore.fetchUsers()
  ])
})

const showForm = ref(false)
const isEditing = ref(false)
const currentDeptId = ref('')

const formData = ref<Partial<Department>>({
  name: '',
  description: '',
  managerId: ''
})

function getManager(id?: string | null) {
  if (!id) return null
  return userStore.users.find(u => u.id === id) || null
}

function getAvatarUrl(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563EB&color=fff&size=24&rounded=true`
}

function openCreate() {
  isEditing.value = false
  currentDeptId.value = ''
  formData.value = { name: '', description: '', managerId: '' }
  showForm.value = true
}

function openEdit(dept: Department) {
  isEditing.value = true
  currentDeptId.value = dept.id
  formData.value = { ...dept }
  showForm.value = true
}

async function handleSave() {
  if (isEditing.value) {
    await departmentStore.updateDepartment(currentDeptId.value, formData.value)
  } else {
    await departmentStore.createDepartment(formData.value)
  }
  showForm.value = false
}

// Focus handlers for inputs
function onFocus(e: Event) {
  const el = e.target as HTMLElement
  el.style.borderColor = '#6366F1'
  el.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'
}
function onBlur(e: Event) {
  const el = e.target as HTMLElement
  el.style.borderColor = '#E2E8F0'
  el.style.boxShadow = 'none'
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;" class="animate-slide-up">
      <div>
        <h1 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px 0;">Departments</h1>
        <p style="font-size: 13px; color: #64748B; margin: 0;">Manage organization structure and department heads.</p>
      </div>
      <button
        @click="openCreate"
        style="
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 16px; font-size: 13px; font-weight: 600;
          color: #fff; background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
          border: none; border-radius: 8px; cursor: pointer; white-space: nowrap;
          box-shadow: 0 2px 8px rgba(99,102,241,0.3); transition: all 0.15s;
        "
        @mouseover="($event.currentTarget as HTMLElement).style.boxShadow='0 4px 16px rgba(99,102,241,0.45)';($event.currentTarget as HTMLElement).style.transform='translateY(-1px)'"
        @mouseleave="($event.currentTarget as HTMLElement).style.boxShadow='0 2px 8px rgba(99,102,241,0.3)';($event.currentTarget as HTMLElement).style.transform='translateY(0)'"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Department
      </button>
    </div>

    <div
      class="animate-slide-up"
      style="
        background: #fff; border: 1px solid #E2E8F0; border-radius: 12px;
        overflow: hidden; box-shadow: 0 1px 4px rgba(15,23,42,0.05); animation-delay: 50ms;
      "
    >
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
            <th style="padding: 14px 20px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">Department Name</th>
            <th style="padding: 14px 20px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">Department Head</th>
            <th style="padding: 14px 20px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">Parent Dept</th>
            <th style="padding: 14px 20px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">Employees</th>
            <th style="padding: 14px 20px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">Status</th>
            <th style="padding: 14px 20px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="departmentStore.isLoading">
            <td colspan="6" style="text-align: center; padding: 60px 0; color: #94A3B8;">
              <svg style="animation: spin 1s linear infinite; margin: 0 auto 12px; display: block;" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              <p style="font-size: 14px; margin: 0;">Loading departments...</p>
            </td>
          </tr>
          <tr v-else-if="departmentStore.departments.length === 0">
            <td colspan="6" style="text-align: center; padding: 60px 20px;">
              <p style="color: #94A3B8; font-size: 14px; margin: 0;">No departments found.</p>
            </td>
          </tr>
          <tr 
            v-else 
            v-for="(dept, idx) in departmentStore.departments" 
            :key="dept.id"
            :style="`border-bottom: ${idx < departmentStore.departments.length - 1 ? '1px solid #F1F5F9' : 'none'}; transition: background 0.15s;`"
            @mouseover="($event.currentTarget as HTMLElement).style.background = '#FAFBFF'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'"
          >
            <td style="padding: 16px 20px;">
              <div style="font-size: 14px; font-weight: 700; color: #0F172A;">{{ dept.name }}</div>
              <div style="font-size: 12px; color: #64748B; margin-top: 2px;">{{ dept.description || 'No description provided' }}</div>
            </td>
            <td style="padding: 16px 20px;">
              <div v-if="getManager(dept.managerId)" style="display: flex; align-items: center; gap: 8px;">
                <img :src="getAvatarUrl(getManager(dept.managerId)!.name)" :alt="getManager(dept.managerId)!.name" style="width: 28px; height: 28px; border-radius: 50%; box-shadow: 0 0 0 2px #fff, 0 0 0 3px #E2E8F0;">
                <span style="font-size: 13px; font-weight: 600; color: #334155;">{{ getManager(dept.managerId)!.name }}</span>
              </div>
              <div v-else style="font-size: 13px; color: #94A3B8; font-style: italic;">Unassigned</div>
            </td>
            <td style="padding: 16px 20px; font-size: 13px; color: #64748B;">-</td>
            <td style="padding: 16px 20px;">
              <span style="font-size: 12px; font-weight: 600; color: #475569; background: #F1F5F9; padding: 4px 10px; border-radius: 999px;">
                42
              </span>
            </td>
            <td style="padding: 16px 20px;">
              <span style="font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; background: #DCFCE7; color: #16A34A;">Active</span>
            </td>
            <td style="padding: 16px 20px; text-align: right;">
              <button
                @click="openEdit(dept)"
                style="padding: 6px 12px; font-size: 12px; font-weight: 600; color: #4F46E5; background: #EEF2FF; border: 1px solid transparent; border-radius: 6px; cursor: pointer; transition: all 0.15s;"
                @mouseover="($event.currentTarget as HTMLElement).style.background = '#E0E7FF'; ($event.currentTarget as HTMLElement).style.borderColor = '#C7D2FE'"
                @mouseleave="($event.currentTarget as HTMLElement).style.background = '#EEF2FF'; ($event.currentTarget as HTMLElement).style.borderColor = 'transparent'"
              >
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form SlideOver -->
    <SlideOver :show="showForm" :title="isEditing ? 'Edit Department' : 'Add New Department'" @close="showForm = false">
      <template #content>
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div>
            <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">Department Name</label>
            <input 
              type="text" 
              v-model="formData.name" 
              placeholder="e.g. Human Resources"
              style="width: 100%; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box;"
              @focus="onFocus" @blur="onBlur"
            >
          </div>
          
          <div>
            <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">Description</label>
            <textarea 
              v-model="formData.description" 
              rows="4" 
              placeholder="Description of responsibilities..."
              style="width: 100%; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box; resize: vertical; font-family: inherit;"
              @focus="onFocus" @blur="onBlur"
            ></textarea>
          </div>
          
          <div>
            <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">Department Head / Manager</label>
            <select 
              v-model="formData.managerId" 
              style="width: 100%; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box; cursor: pointer;"
              @focus="onFocus" @blur="onBlur"
            >
              <option value="">-- No Manager Assigned --</option>
              <option v-for="user in userStore.users" :key="user.id" :value="user.id">{{ user.name }} ({{ user.email }})</option>
            </select>
          </div>
        </div>
      </template>
      <template #footer>
        <button
          type="button"
          style="padding: 9px 20px; font-size: 13px; font-weight: 600; color: #475569; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; cursor: pointer; transition: all 0.15s;"
          @mouseover="($event.currentTarget as HTMLElement).style.background = '#F8FAFC'"
          @mouseleave="($event.currentTarget as HTMLElement).style.background = '#fff'"
          @click="showForm = false"
        >
          Cancel
        </button>
        <button
          type="button"
          style="
            padding: 9px 20px; font-size: 13px; font-weight: 600; color: #fff;
            background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
            border: none; border-radius: 8px; cursor: pointer;
            box-shadow: 0 2px 8px rgba(99,102,241,0.35); transition: all 0.15s;
          "
          @mouseover="($event.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(99,102,241,0.45)'; ($event.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(99,102,241,0.35)'; ($event.currentTarget as HTMLElement).style.transform = 'translateY(0)'"
          @click="handleSave"
        >
          Save Department
        </button>
      </template>
    </SlideOver>
  </div>
</template>

<style>
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
