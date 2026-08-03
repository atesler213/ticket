<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '../../stores/settings'
import type { Settings } from '../../types/Settings'

const settingsStore = useSettingsStore()
const activeTab = ref('general')

const formData = ref<Partial<Settings>>({
  companyName: 'TechCorp Inc.',
  supportEmail: 'support@techcorp.com',
  defaultTimezone: 'UTC-08:00 (Pacific Time - US & Canada)',
  defaultLanguage: 'English (US)'
})

const isSaving = ref(false)
const saveSuccess = ref(false)

onMounted(async () => {
  await settingsStore.fetchSettings()
  const s = settingsStore.settingsList[0]
  if (s) {
    formData.value = { ...s }
  } else {
    // mock initial data if empty
    formData.value.companyId = 'comp-1'
  }
})

const tabs = [
  { id: 'general', name: 'General Information' },
  { id: 'branding', name: 'Branding & Theme' },
  { id: 'email', name: 'Email Settings' },
  { id: 'security', name: 'Security & Authentication' },
  { id: 'business_hours', name: 'Business Hours' },
  { id: 'ticket_fields', name: 'Ticket Form Fields' }
]

async function saveSettings() {
  isSaving.value = true
  saveSuccess.value = false
  
  if (formData.value.companyId) {
    await settingsStore.updateSettings(formData.value.companyId, formData.value)
  }
  
  setTimeout(() => {
    isSaving.value = false
    saveSuccess.value = true
    setTimeout(() => saveSuccess.value = false, 3000)
  }, 600)
}
</script>

<template>
  <div>
    <div class="flex gap-6">
      <!-- Settings Nav -->
      <div class="w-64 shrink-0">
        <div class="card card-no-hover animate-slide-up p-2">
          <nav class="space-y-1">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id" 
              :class="activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'" 
              class="w-full text-left flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>
      </div>

      <!-- Settings Form -->
      <div class="flex-1">
        <div v-if="activeTab === 'general'" class="card card-no-hover animate-slide-up" style="animation-delay: 50ms;">
          <div class="card-header flex justify-between items-center" style="padding:20px 24px;">
            <h2 class="text-lg font-semibold text-gray-900">General Information</h2>
            <span v-if="saveSuccess" class="text-sm text-green-600 font-medium flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Saved
            </span>
          </div>
          <div class="card-body" style="padding:24px;">
            <form class="space-y-6 max-w-2xl" @submit.prevent="saveSettings">
              <div>
                <label class="form-label">Company Name</label>
                <input type="text" v-model="formData.companyName" class="form-input w-full">
              </div>
              <div>
                <label class="form-label">Support Email Address</label>
                <input type="email" v-model="formData.supportEmail" class="form-input w-full">
                <p class="text-xs text-gray-500 mt-1">Users can email this address to automatically create tickets.</p>
              </div>
              <div>
                <label class="form-label">Timezone</label>
                <select v-model="formData.defaultTimezone" class="form-select w-full">
                  <option>UTC-08:00 (Pacific Time - US & Canada)</option>
                  <option>UTC-05:00 (Eastern Time - US & Canada)</option>
                  <option>UTC+00:00 (London, Dublin, Lisbon)</option>
                  <option>UTC+03:00 (Istanbul, Moscow)</option>
                </select>
              </div>
              <div>
                <label class="form-label">Language</label>
                <select v-model="formData.defaultLanguage" class="form-select w-full">
                  <option>English (US)</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
              <hr class="border-gray-200">
              <div class="flex justify-end gap-3">
                <button type="submit" class="btn btn-primary" :disabled="isSaving">
                  {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div v-else class="card card-no-hover animate-slide-up" style="animation-delay: 50ms;">
          <div class="card-header" style="padding:20px 24px;">
            <h2 class="text-lg font-semibold text-gray-900">{{ tabs.find(t => t.id === activeTab)?.name }}</h2>
          </div>
          <div class="card-body" style="padding:24px;">
            <p class="text-gray-500 text-sm">Settings for this section will be implemented in a future milestone.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
