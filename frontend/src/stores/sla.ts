import { defineStore } from 'pinia'
import { ref } from 'vue'
import { SLAService } from '../services/SLAService'
import type { SLAPolicy } from '../types/SLAPolicy'

export const useSLAStore = defineStore('sla', () => {
  const policies = ref<SLAPolicy[]>([])
  const isLoading = ref(false)

  async function fetchAll() {
    isLoading.value = true
    try {
      policies.value = await SLAService.getAll()
    } finally {
      isLoading.value = false
    }
  }

  async function createPolicy(policy: Partial<SLAPolicy>) {
    isLoading.value = true
    try {
      const newPolicy = await SLAService.create(policy)
      policies.value.push(newPolicy)
      return newPolicy
    } finally {
      isLoading.value = false
    }
  }

  async function updatePolicy(id: string, updates: Partial<SLAPolicy>) {
    isLoading.value = true
    try {
      const updated = await SLAService.update(id, updates)
      const index = policies.value.findIndex(p => p.id === id)
      if (index !== -1) {
        policies.value[index] = updated
      }
      return updated
    } finally {
      isLoading.value = false
    }
  }

  async function deletePolicy(id: string) {
    isLoading.value = true
    try {
      await SLAService.delete(id)
      policies.value = policies.value.filter(p => p.id !== id)
    } finally {
      isLoading.value = false
    }
  }

  return { policies, isLoading, fetchAll, createPolicy, updatePolicy, deletePolicy }
})
