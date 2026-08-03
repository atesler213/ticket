import { defineStore } from 'pinia'
import { ref } from 'vue'
import { RoleService } from '../services/OtherServices'
import type { Role } from '../types/Role'

export const useRoleStore = defineStore('role', () => {
  const roles = ref<Role[]>([])
  const isLoading = ref(false)

  async function fetchRoles() {
    isLoading.value = true
    try {
      roles.value = await RoleService.getAll()
    } finally {
      isLoading.value = false
    }
  }

  async function createRole(data: Partial<Role>) {
    const newRole = await RoleService.create(data)
    roles.value.push(newRole)
    return newRole
  }

  async function updateRole(id: string, updates: Partial<Role>) {
    const updated = await RoleService.update(id, updates)
    const index = roles.value.findIndex(r => r.id === id)
    if (index !== -1) {
      roles.value[index] = updated
    }
    return updated
  }

  async function deleteRole(id: string) {
    await RoleService.delete(id)
    roles.value = roles.value.filter(r => r.id !== id)
  }

  return { roles, isLoading, fetchRoles, createRole, updateRole, deleteRole }
})
