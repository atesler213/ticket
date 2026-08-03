import { defineStore } from 'pinia'
import { ref } from 'vue'
import { CompanyService } from '../services/CompanyService'
import type { Company } from '../types/Company'

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

  return { company, isLoading, fetchTenantConfiguration }
})
