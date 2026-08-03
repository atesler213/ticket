import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DepartmentService } from '../services/OtherServices'
import type { Department } from '../types/Department'

export const useDepartmentStore = defineStore('department', () => {
  const departments = ref<Department[]>([])
  const isLoading = ref(false)

  async function fetchDepartments() {
    isLoading.value = true
    try {
      departments.value = await DepartmentService.getAll()
    } finally {
      isLoading.value = false
    }
  }

  async function createDepartment(data: Partial<Department>) {
    const newDept = await DepartmentService.create(data)
    departments.value.push(newDept)
    return newDept
  }

  async function updateDepartment(id: string, updates: Partial<Department>) {
    const updated = await DepartmentService.update(id, updates)
    const index = departments.value.findIndex(d => d.id === id)
    if (index !== -1) {
      departments.value[index] = updated
    }
    return updated
  }

  async function deleteDepartment(id: string) {
    await DepartmentService.delete(id)
    departments.value = departments.value.filter(d => d.id !== id)
  }

  return { departments, isLoading, fetchDepartments, createDepartment, updateDepartment, deleteDepartment }
})
