<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { useDepartmentStore } from '../../stores/department'
import SlideOver from '../../components/admin/SlideOver.vue'
import type { User } from '../../types/User'

const userStore = useUserStore()
const departmentStore = useDepartmentStore()

onMounted(async () => {
  await Promise.all([
    userStore.fetchUsers(),
    departmentStore.fetchDepartments()
  ])
})

const showForm = ref(false)
const isEditing = ref(false)
const currentUserId = ref('')

const formData = ref<Partial<User>>({
  name: '',
  email: '',
  role: 'Employee',
  departmentId: '',
  isActive: true
})

const searchQuery = ref('')
const filterRole = ref('All Roles')
const filterDept = ref('All Departments')

const filteredUsers = computed(() => {
  return userStore.users.filter(u => {
    const q = searchQuery.value.toLowerCase()
    const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    
    let matchesRole = true
    if (filterRole.value !== 'All Roles') {
      matchesRole = u.role === filterRole.value || (filterRole.value === 'Administrator' && u.role === 'System Administrator')
    }

    let matchesDept = true
    if (filterDept.value !== 'All Departments') {
      const deptName = getDepartmentName(u.departmentId)
      matchesDept = deptName === filterDept.value
    }

    return matchesSearch && matchesRole && matchesDept
  })
})

function getDepartmentName(id?: string | null) {
  if (!id) return 'None'
  const dept = departmentStore.departments.find(d => d.id === id)
  return dept ? dept.name : 'Unknown'
}

function getAvatarUrl(name: string, bg: string = '6366F1') {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&size=32&rounded=true`
}

function openCreate() {
  isEditing.value = false
  currentUserId.value = ''
  formData.value = { name: '', email: '', role: 'Employee', departmentId: '', isActive: true }
  showForm.value = true
}

function openEdit(user: User) {
  isEditing.value = true
  currentUserId.value = user.id
  formData.value = { ...user }
  showForm.value = true
}

async function handleDelete(user: User) {
  if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
    await userStore.deleteUser(user.id)
  }
}

async function handleSave() {
  if (isEditing.value) {
    await userStore.updateUser(currentUserId.value, formData.value)
  } else {
    // Generate simple ID if none exists, in real app backend does this
    formData.value.id = `usr-${Date.now()}`
    formData.value.createdAt = new Date().toISOString()
    formData.value.updatedAt = new Date().toISOString()
    formData.value.companyId = 'comp-1' // hardcoded default
    await userStore.createUser(formData.value)
  }
  showForm.value = false
}
</script>

<template>
  <div>
    <!-- Filters -->
    <div class="card card-no-hover mb-5 animate-slide-up">
      <div class="card-body-compact flex items-center justify-between flex-wrap">
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <div class="relative w-64">
            <svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:var(--gray-400);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" v-model="searchQuery" class="form-input" style="padding-left:36px;height:38px;" placeholder="Search users...">
          </div>
          <select v-model="filterRole" class="form-select" style="width:140px;height:38px;font-size:13px;">
            <option>All Roles</option>
            <option>Employee</option>
            <option>Support Agent</option>
            <option>IT Support Agent</option>
            <option>Administrator</option>
          </select>
          <select v-model="filterDept" class="form-select" style="width:160px;height:38px;font-size:13px;">
            <option>All Departments</option>
            <option v-for="dept in departmentStore.departments" :key="dept.id" :value="dept.name">{{ dept.name }}</option>
            <option>None</option>
          </select>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary btn-sm">Export</button>
          <button class="btn btn-primary btn-sm" @click="openCreate">Add User</button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-container animate-slide-up">
      <table class="table">
        <thead>
          <tr>
            <th><input type="checkbox" class="rounded"></th>
            <th>Name / Email</th>
            <th>Department</th>
            <th>System Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="7" class="text-center py-8 text-gray-500">No users found</td>
          </tr>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td><input type="checkbox" class="rounded"></td>
            <td>
              <div class="flex items-center gap-3">
                <img :src="getAvatarUrl(user.name, user.isActive ? '6366F1' : '9CA3AF')" :alt="user.name.charAt(0)" class="rounded-full w-8 h-8">
                <div>
                  <div class="font-medium text-gray-900 text-sm">{{ user.name }}</div>
                  <div class="text-xs text-gray-500">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td>{{ getDepartmentName(user.departmentId) }}</td>
            <td>
              <span class="badge text-xs" 
                :class="{
                  'badge-pending text-primary-700 bg-primary-50': user.role.includes('Admin'),
                  'text-emerald-700 bg-emerald-50': user.role.includes('Agent'),
                  'text-slate-600 bg-slate-100': user.role === 'Employee'
                }">
                {{ user.role }}
              </span>
            </td>
            <td>
              <span v-if="user.isActive" class="badge badge-active text-xs">Active</span>
              <span v-else class="badge badge-inactive text-xs" style="background:#FEE2E2;color:#DC2626;">Suspended</span>
            </td>
            <td class="text-sm text-gray-500">{{ new Date(user.createdAt).toLocaleDateString() }}</td>
            <td>
              <div class="flex items-center gap-2">
                <button @click="openEdit(user)" class="text-gray-400 hover:text-primary-600" title="Edit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button @click="handleDelete(user)" class="text-gray-400 hover:text-red-600" title="Delete">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination">
        <div class="pagination-info">Showing {{ filteredUsers.length }} users</div>
      </div>
    </div>

    <!-- Form SlideOver -->
    <SlideOver :show="showForm" :title="isEditing ? 'Edit User' : 'Add New User'" @close="showForm = false">
      <template #content>
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" v-model="formData.name" class="form-input w-full" placeholder="John Doe">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" v-model="formData.email" class="form-input w-full" placeholder="john@example.com">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select v-model="formData.role" class="form-select w-full">
              <option value="Employee">Employee</option>
              <option value="Support Agent">Support Agent</option>
              <option value="IT Support Agent">IT Support Agent</option>
              <option value="System Administrator">Administrator</option>
              <option value="CISO / ISB">CISO / ISB</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select v-model="formData.departmentId" class="form-select w-full">
              <option value="">None</option>
              <option v-for="dept in departmentStore.departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
            </select>
          </div>
          <div v-if="isEditing">
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select v-model="formData.isActive" class="form-select w-full">
              <option :value="true">Active</option>
              <option :value="false">Suspended</option>
            </select>
          </div>
        </div>
      </template>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="showForm = false">Cancel</button>
        <button type="button" class="btn btn-primary ml-3" @click="handleSave">Save User</button>
      </template>
    </SlideOver>
  </div>
</template>
