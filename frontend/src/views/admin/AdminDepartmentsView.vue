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
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6 animate-slide-up">
      <p class="text-sm text-gray-500">Manage organization departments and their heads.</p>
      <button class="btn btn-primary btn-sm" @click="openCreate">Add Department</button>
    </div>

    <div class="table-container animate-slide-up">
      <table class="table">
        <thead>
          <tr>
            <th>Department Name</th>
            <th>Department Head</th>
            <th>Parent Department</th>
            <th>Employees</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="departmentStore.isLoading">
            <td colspan="6" class="text-center py-8 text-gray-400">Loading...</td>
          </tr>
          <tr v-else-if="departmentStore.departments.length === 0">
            <td colspan="6" class="text-center py-8 text-gray-400">No departments found.</td>
          </tr>
          <tr v-else v-for="dept in departmentStore.departments" :key="dept.id">
            <td class="font-medium text-gray-900">{{ dept.name }}</td>
            <td>
              <div v-if="getManager(dept.managerId)" class="flex items-center gap-2">
                <img :src="getAvatarUrl(getManager(dept.managerId)!.name)" :alt="getManager(dept.managerId)!.name" class="w-6 h-6 rounded-full">
                {{ getManager(dept.managerId)!.name }}
              </div>
              <div v-else class="text-gray-400">-</div>
            </td>
            <td class="text-gray-500">-</td>
            <td>42</td>
            <td><span class="badge badge-active text-xs">Active</span></td>
            <td>
              <button @click="openEdit(dept)" class="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form SlideOver -->
    <SlideOver :show="showForm" :title="isEditing ? 'Edit Department' : 'Add New Department'" @close="showForm = false">
      <template #content>
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input type="text" v-model="formData.name" class="form-input w-full" placeholder="e.g. Human Resources">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea v-model="formData.description" class="form-input w-full" rows="3" placeholder="Description of responsibilities..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Department Head / Manager</label>
            <select v-model="formData.managerId" class="form-select w-full">
              <option value="">None</option>
              <option v-for="user in userStore.users" :key="user.id" :value="user.id">{{ user.name }} ({{ user.email }})</option>
            </select>
          </div>
        </div>
      </template>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="showForm = false">Cancel</button>
        <button type="button" class="btn btn-primary" @click="handleSave">Save</button>
      </template>
    </SlideOver>
  </div>
</template>
