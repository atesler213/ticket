import { defineStore } from 'pinia'
import { ref } from 'vue'
import { SettingsService } from '../services/OtherServices'
import type { Settings } from '../types/Settings'

const SETTINGS_CACHE_KEY = 'ticket.settings.cache.v1'

export const useSettingsStore = defineStore('settings', () => {
  const settingsList = ref<Settings[]>([])
  const isLoading = ref(false)

  function loadCachedSettings(): Settings[] {
    const raw = localStorage.getItem(SETTINGS_CACHE_KEY)
    if (!raw) return []

    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as Settings[]) : []
    } catch {
      return []
    }
  }

  function persistSettings(list: Settings[]) {
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(list))
  }

  async function fetchSettings() {
    isLoading.value = true
    try {
      const remoteSettings = await SettingsService.getAll()
      const cachedSettings = loadCachedSettings()

      if (cachedSettings.length === 0) {
        settingsList.value = remoteSettings
      } else {
        settingsList.value = remoteSettings.map((item) => {
          const cachedItem = cachedSettings.find(c => c.companyId === item.companyId)
          return cachedItem ? { ...item, ...cachedItem } : item
        })
      }

      persistSettings(settingsList.value)
    } finally {
      isLoading.value = false
    }
  }

  async function updateSettings(companyId: string, updates: Partial<Settings>) {
    const current = settingsList.value.find(s => s.companyId === companyId)
    const payload: Settings = {
      companyId,
      allowGuestTickets: false,
      defaultTimezone: 'UTC',
      defaultLanguage: 'en-US',
      ticketPrefix: 'SRV-',
      requireApprovalForAssets: false,
      smtpServer: null,
      smtpPort: null,
      ...current,
      ...updates
    }

    const updated = await SettingsService.update(companyId, payload)
    const mergedUpdated = { ...payload, ...updated }
    const index = settingsList.value.findIndex(s => s.companyId === companyId)

    if (index !== -1) {
      settingsList.value[index] = mergedUpdated
    } else {
      settingsList.value.push(mergedUpdated)
    }

    persistSettings(settingsList.value)
    return mergedUpdated
  }

  return { settingsList, isLoading, fetchSettings, updateSettings }
})
