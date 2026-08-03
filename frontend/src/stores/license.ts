import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LicenseService } from '../services/LicenseService'
import type { License } from '../types/License'

export const useLicenseStore = defineStore('license', () => {
  const licenses = ref<License[]>([])
  const isLoading = ref(false)

  const stats = computed(() => {
    let totalLicenses = 0
    let assigned = 0
    let expiringSoon = 0
    let totalMonthlyCost = 0

    const now = new Date().getTime()
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000

    for (const lic of licenses.value) {
      totalLicenses += lic.totalSeats
      assigned += lic.assignedSeats
      totalMonthlyCost += lic.monthlyCost

      if (lic.expirationDate) {
        const expTime = new Date(lic.expirationDate).getTime()
        const diff = expTime - now
        if (diff > 0 && diff <= thirtyDaysMs) {
          expiringSoon++
        }
      }
    }

    return {
      totalLicenses,
      assigned,
      available: Math.max(0, totalLicenses - assigned),
      expiringSoon,
      totalMonthlyCost
    }
  })

  async function fetchLicenses() {
    isLoading.value = true
    try {
      licenses.value = await LicenseService.getAll()
    } finally {
      isLoading.value = false
    }
  }

  async function createLicense(data: Partial<License>) {
    const newLic = await LicenseService.create(data)
    licenses.value.push(newLic)
    return newLic
  }

  async function updateLicense(id: string, updates: Partial<License>) {
    const updated = await LicenseService.update(id, updates)
    const index = licenses.value.findIndex(l => l.id === id)
    if (index !== -1) {
      licenses.value[index] = updated
    }
    return updated
  }

  async function deleteLicense(id: string) {
    await LicenseService.delete(id)
    licenses.value = licenses.value.filter(l => l.id !== id)
  }

  async function assignUserToLicense(licenseId: string, user: { id: string; name: string; department?: string }) {
    const lic = licenses.value.find(l => l.id === licenseId)
    if (!lic) return

    const newAssignedUsers = [...(lic.assignedUsers || []), { ...user, assignedAt: new Date().toISOString() }]
    const newAssignedSeats = lic.assignedSeats + 1
    
    // Auto-update status if over capacity
    let status = lic.status
    if (newAssignedSeats > lic.totalSeats) {
      status = 'Over-capacity'
    } else if (status === 'Unassigned' && newAssignedSeats > 0) {
      status = 'Active'
    }

    await updateLicense(licenseId, { 
      assignedUsers: newAssignedUsers,
      assignedSeats: newAssignedSeats,
      status
    })
  }

  async function unassignUserFromLicense(licenseId: string, userId: string) {
    const lic = licenses.value.find(l => l.id === licenseId)
    if (!lic) return

    const newAssignedUsers = lic.assignedUsers.filter(u => u.id !== userId)
    const newAssignedSeats = Math.max(0, lic.assignedSeats - 1)
    
    let status = lic.status
    if (status === 'Over-capacity' && newAssignedSeats <= lic.totalSeats) {
      status = 'Active'
    }
    if (newAssignedSeats === 0 && status !== 'Expired' && status !== 'Expiring Soon') {
      status = 'Unassigned'
    }

    await updateLicense(licenseId, {
      assignedUsers: newAssignedUsers,
      assignedSeats: newAssignedSeats,
      status
    })
  }

  return { 
    licenses, 
    isLoading, 
    stats,
    fetchLicenses, 
    createLicense, 
    updateLicense, 
    deleteLicense,
    assignUserToLicense,
    unassignUserFromLicense
  }
})
