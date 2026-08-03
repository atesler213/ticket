import { defineStore } from 'pinia'
import { ref } from 'vue'
import { CompanyService } from '../services/CompanyService'
import type { Company } from '../types/Company'
import type { Settings } from '../types/Settings'

const SETTINGS_CACHE_KEY = 'ticket.settings.cache.v1'

function getCachedSettings(companyId?: string): Partial<Settings> | null {
  const raw = localStorage.getItem(SETTINGS_CACHE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Settings[]
    if (!Array.isArray(parsed) || parsed.length === 0) return null

    if (companyId) {
      return parsed.find(item => item.companyId === companyId) || null
    }

    return parsed[0]
  } catch {
    return null
  }
}

function mapSettingsToCompany(current: Company, settings: Partial<Settings>): Company {
  return {
    ...current,
    name: settings.companyName || current.name,
    supportEmail: settings.supportEmail || current.supportEmail,
    primaryColor: settings.brandingPrimaryColor || current.primaryColor,
    logo: settings.brandingLogoUrl || current.logo,
    language: settings.defaultLanguage || current.language,
    timezone: settings.defaultTimezone || current.timezone
  }
}

export const useTenantStore = defineStore('tenant', () => {
  const company = ref<Company | null>(null)
  const isLoading = ref(true)

  async function fetchTenantConfiguration() {
    isLoading.value = true
    try {
      // In reality, this might be getBySubdomain(window.location.hostname)
      // We'll mock it by just loading the first company
      const companies = await CompanyService.getAll()
      company.value = companies[0] || null

      if (company.value) {
        const cachedSettings = getCachedSettings(company.value.id)
        if (cachedSettings) {
          company.value = mapSettingsToCompany(company.value, cachedSettings)
        }
      }
      
      if (company.value) {
        applyTheme(company.value)
      }
    } finally {
      isLoading.value = false
    }
  }

  function applyTheme(cfg: Company) {
    const root = document.documentElement
    root.style.setProperty('--primary-600', cfg.primaryColor)
    // Add other dynamic styles here based on config
  }

  function syncCompanyFromSettings(settings: Partial<Settings>) {
    if (!company.value) return

    company.value = mapSettingsToCompany(company.value, settings)
    applyTheme(company.value)
  }

  return { company, isLoading, fetchTenantConfiguration, syncCompanyFromSettings }
})
