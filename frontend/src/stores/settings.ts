import { defineStore } from 'pinia'
import { ref } from 'vue'
import { SettingsService } from '../services/OtherServices'
import type { Settings } from '../types/Settings'

export const useSettingsStore = defineStore('settings', () => {
  const settingsList = ref<Settings[]>([])
  const isLoading = ref(false)

  async function fetchSettings() {
    isLoading.value = true
    try {
      settingsList.value = await SettingsService.getAll()
    } finally {
      isLoading.value = false
    }
  }

  async function updateSettings(companyId: string, updates: Partial<Settings>) {
    const updated = await SettingsService.update(companyId, updates)
    const index = settingsList.value.findIndex(s => s.companyId === companyId)
    if (index !== -1) {
      settingsList.value[index] = updated
    }
    return updated
  }

  return { settingsList, isLoading, fetchSettings, updateSettings }
})
