<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '../../stores/settings'
import { useTenantStore } from '../../stores/tenant'
import type { Settings } from '../../types/Settings'

const settingsStore = useSettingsStore()
const tenantStore = useTenantStore()
const activeTab = ref('general')

const formData = ref<Partial<Settings>>({
  companyId: 'comp-1',
  companyName: 'TechCorp Inc.',
  supportEmail: 'support@techcorp.com',
  defaultTimezone: 'UTC-08:00 (Pacific Time - US & Canada)',
  defaultLanguage: 'English (US)',
  smtpServer: 'smtp.office365.com',
  smtpPort: 587,
  smtpFromName: 'TechCorp Help Desk',
  smtpFromEmail: 'helpdesk@techcorp.com'
})

const isSaving = ref(false)
const saveSuccess = ref(false)
const isSendingTestEmail = ref(false)
const emailTestMessage = ref('')

onMounted(async () => {
  await settingsStore.fetchSettings()
  const s = settingsStore.settingsList[0]
  if (s) {
    formData.value = { ...formData.value, ...s }
  } else {
    // mock initial data if empty
    formData.value.companyId = 'comp-1'
  }
})

const tabs = [
  { id: 'general', name: 'General Information', icon: 'M4 6h16M4 12h16M4 18h7' },
  { id: 'branding', name: 'Branding & Theme', icon: 'M7 21a4 4 0 0 1-4-4V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12a4 4 0 0 1-4 4zm0 0h12a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 0 1 2.828 0l2.829 2.829a2 2 0 0 1 0 2.828l-8.486 8.485M7 3v4M3 7h4' },
  { id: 'email', name: 'Email Settings', icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6' },
  { id: 'security', name: 'Security & Authentication', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { id: 'business_hours', name: 'Business Hours', icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2' },
  { id: 'ticket_fields', name: 'Ticket Form Fields', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' }
]

async function saveSettings() {
  isSaving.value = true
  saveSuccess.value = false
  emailTestMessage.value = ''
  
  if (formData.value.companyId) {
    await settingsStore.updateSettings(formData.value.companyId, formData.value)
    tenantStore.syncCompanyFromSettings(formData.value)
  }
  
  setTimeout(() => {
    isSaving.value = false
    saveSuccess.value = true
    setTimeout(() => saveSuccess.value = false, 3000)
  }, 600)
}

async function sendTestEmail() {
  emailTestMessage.value = ''

  if (!formData.value.smtpServer || !formData.value.smtpPort || !formData.value.smtpFromEmail) {
    emailTestMessage.value = 'Please fill SMTP server, port, and sender email first.'
    return
  }

  isSendingTestEmail.value = true

  await new Promise(resolve => setTimeout(resolve, 900))

  isSendingTestEmail.value = false
  emailTestMessage.value = `Test email queued via ${formData.value.smtpServer}:${formData.value.smtpPort}`
}

// Focus handlers for inputs
function onFocus(e: Event) {
  const el = e.target as HTMLElement
  el.style.borderColor = '#6366F1'
  el.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'
}
function onBlur(e: Event) {
  const el = e.target as HTMLElement
  el.style.borderColor = '#E2E8F0'
  el.style.boxShadow = 'none'
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;" class="animate-slide-up">
      <div>
        <h1 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px 0;">System Settings</h1>
        <p style="font-size: 13px; color: #64748B; margin: 0;">Configure global application preferences and ISO policies.</p>
      </div>
    </div>

    <div style="display: flex; gap: 24px; align-items: flex-start;">
      <!-- Settings Nav -->
      <div 
        class="animate-slide-up" 
        style="
          width: 280px; flex-shrink: 0; background: #fff; 
          border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px;
          box-shadow: 0 1px 4px rgba(15,23,42,0.05);
        "
      >
        <nav style="display: flex; flex-direction: column; gap: 4px;">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id" 
            :style="`
              display: flex; align-items: center; gap: 12px; width: 100%; text-align: left;
              padding: 10px 14px; font-size: 13px; font-weight: 600; border-radius: 8px; border: none;
              cursor: pointer; transition: all 0.15s;
              ${activeTab === tab.id 
                ? 'background: #EEF2FF; color: #4F46E5;' 
                : 'background: transparent; color: #475569;'}
            `"
            @mouseover="activeTab !== tab.id && (($event.currentTarget as HTMLElement).style.background = '#F8FAFC')"
            @mouseleave="activeTab !== tab.id && (($event.currentTarget as HTMLElement).style.background = 'transparent')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path :d="tab.icon"/>
            </svg>
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Settings Form -->
      <div style="flex: 1;">
        <div 
          v-if="activeTab === 'general'" 
          class="animate-slide-up" 
          style="
            background: #fff; border: 1px solid #E2E8F0; border-radius: 12px;
            box-shadow: 0 1px 4px rgba(15,23,42,0.05); animation-delay: 50ms;
          "
        >
          <div style="padding: 20px 24px; border-bottom: 1px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;">General Information</h2>
            <div 
              v-if="saveSuccess" 
              style="
                display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600;
                color: #10B981; background: #ECFDF5; padding: 4px 12px; border-radius: 999px;
                animation: fade-in 0.3s;
              "
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Settings Saved
            </div>
          </div>
          
          <div style="padding: 24px;">
            <form @submit.prevent="saveSettings" style="display: flex; flex-direction: column; gap: 24px; max-width: 600px;">
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">Company Name</label>
                <input 
                  type="text" 
                  v-model="formData.companyName" 
                  style="width: 100%; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box;"
                  @focus="onFocus" @blur="onBlur"
                >
              </div>
              
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">Support Email Address</label>
                <input 
                  type="email" 
                  v-model="formData.supportEmail" 
                  style="width: 100%; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box;"
                  @focus="onFocus" @blur="onBlur"
                >
                <p style="font-size: 12px; color: #94A3B8; margin: 6px 0 0 0;">Users can email this address to automatically create tickets.</p>
              </div>
              
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">Timezone</label>
                <select 
                  v-model="formData.defaultTimezone" 
                  style="width: 100%; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box; cursor: pointer;"
                  @focus="onFocus" @blur="onBlur"
                >
                  <option>UTC-08:00 (Pacific Time - US & Canada)</option>
                  <option>UTC-05:00 (Eastern Time - US & Canada)</option>
                  <option>UTC+00:00 (London, Dublin, Lisbon)</option>
                  <option>UTC+03:00 (Istanbul, Moscow)</option>
                </select>
              </div>
              
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">Language</label>
                <select 
                  v-model="formData.defaultLanguage" 
                  style="width: 100%; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box; cursor: pointer;"
                  @focus="onFocus" @blur="onBlur"
                >
                  <option>English (US)</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
              
              <div style="margin-top: 12px; padding-top: 24px; border-top: 1px solid #F1F5F9; display: flex; justify-content: flex-end;">
                <button
                  type="submit"
                  :disabled="isSaving"
                  style="
                    padding: 10px 24px; font-size: 13px; font-weight: 600; color: #fff;
                    background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
                    border: none; border-radius: 8px; cursor: pointer;
                    box-shadow: 0 2px 8px rgba(99,102,241,0.35); transition: all 0.15s;
                    display: inline-flex; align-items: center; gap: 6px;
                  "
                  @mouseover="!isSaving && (($event.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(99,102,241,0.45)', ($event.currentTarget as HTMLElement).style.transform = 'translateY(-1px)')"
                  @mouseleave="!isSaving && (($event.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(99,102,241,0.35)', ($event.currentTarget as HTMLElement).style.transform = 'translateY(0)')"
                >
                  <svg v-if="isSaving" style="animation: spin 1s linear infinite;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ isSaving ? 'Saving Changes...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div v-else-if="activeTab === 'branding'" class="animate-slide-up" style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; box-shadow: 0 1px 4px rgba(15,23,42,0.05); animation-delay: 50ms;">
          <div style="padding: 20px 24px; border-bottom: 1px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;">Branding & Theme</h2>
            <div v-if="saveSuccess" style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #10B981; background: #ECFDF5; padding: 4px 12px; border-radius: 999px; animation: fade-in 0.3s;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Settings Saved</div>
          </div>
          <div style="padding: 24px;">
            <form @submit.prevent="saveSettings" style="display: flex; flex-direction: column; gap: 24px; max-width: 600px;">
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">Primary Theme Color</label>
                <div style="display:flex; gap:12px; align-items:center;">
                  <input type="color" v-model="formData.brandingPrimaryColor" style="width: 42px; height: 42px; border: 1px solid #E2E8F0; border-radius: 8px; cursor: pointer; padding:2px;">
                  <input type="text" v-model="formData.brandingPrimaryColor" style="flex:1; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box;" @focus="onFocus" @blur="onBlur">
                </div>
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">Company Logo URL</label>
                <input type="text" v-model="formData.brandingLogoUrl" placeholder="https://example.com/logo.png" style="width: 100%; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box;" @focus="onFocus" @blur="onBlur">
              </div>
              <div style="margin-top: 12px; padding-top: 24px; border-top: 1px solid #F1F5F9; display: flex; justify-content: flex-end;">
                <button type="submit" :disabled="isSaving" style="padding: 10px 24px; font-size: 13px; font-weight: 600; color: #fff; background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(99,102,241,0.35); transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px;" @mouseover="!isSaving && (($event.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(99,102,241,0.45)', ($event.currentTarget as HTMLElement).style.transform = 'translateY(-1px)')" @mouseleave="!isSaving && (($event.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(99,102,241,0.35)', ($event.currentTarget as HTMLElement).style.transform = 'translateY(0)')">
                  <svg v-if="isSaving" style="animation: spin 1s linear infinite;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg><svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>{{ isSaving ? 'Saving Changes...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div v-else-if="activeTab === 'email'" class="animate-slide-up" style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; box-shadow: 0 1px 4px rgba(15,23,42,0.05); animation-delay: 50ms;">
          <div style="padding: 20px 24px; border-bottom: 1px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;">Email Settings</h2>
            <div v-if="saveSuccess" style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #10B981; background: #ECFDF5; padding: 4px 12px; border-radius: 999px; animation: fade-in 0.3s;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Settings Saved</div>
          </div>
          <div style="padding: 24px;">
            <form @submit.prevent="saveSettings" style="display: flex; flex-direction: column; gap: 24px; max-width: 700px;">
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                <div>
                  <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">Support Email Address</label>
                  <input type="email" v-model="formData.supportEmail" placeholder="support@company.com" style="width: 100%; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box;" @focus="onFocus" @blur="onBlur">
                </div>
                <div>
                  <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">From Name</label>
                  <input type="text" v-model="formData.smtpFromName" placeholder="TechCorp Support" style="width: 100%; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box;" @focus="onFocus" @blur="onBlur">
                </div>
              </div>
              <div style="display:grid; grid-template-columns: 1fr 140px; gap:16px;">
                <div>
                  <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">SMTP Server</label>
                  <input type="text" v-model="formData.smtpServer" placeholder="smtp.example.com" style="width: 100%; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box;" @focus="onFocus" @blur="onBlur">
                </div>
                <div>
                  <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">SMTP Port</label>
                  <input type="number" min="1" max="65535" v-model.number="formData.smtpPort" placeholder="587" style="width: 100%; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box;" @focus="onFocus" @blur="onBlur">
                </div>
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">From Email Address</label>
                <input type="email" v-model="formData.smtpFromEmail" placeholder="helpdesk@company.com" style="width: 100%; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box;" @focus="onFocus" @blur="onBlur">
                <p style="font-size: 12px; color: #94A3B8; margin: 6px 0 0 0;">Outgoing notifications and replies will use this sender identity.</p>
              </div>

              <div style="padding: 12px 14px; border-radius: 8px; border: 1px solid #E2E8F0; background: #F8FAFC; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                <div>
                  <p style="margin:0; font-size: 13px; font-weight: 600; color:#0F172A;">Connection Test</p>
                  <p style="margin:2px 0 0 0; font-size: 12px; color:#64748B;">Validate SMTP credentials and sender configuration.</p>
                </div>
                <button type="button" :disabled="isSendingTestEmail" @click="sendTestEmail" style="padding: 8px 14px; font-size: 12px; font-weight: 600; color: #1D4ED8; background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; cursor: pointer; white-space: nowrap;">
                  {{ isSendingTestEmail ? 'Testing...' : 'Send Test Email' }}
                </button>
              </div>

              <p v-if="emailTestMessage" style="margin: -8px 0 0 0; font-size: 12px; color: #2563EB;">{{ emailTestMessage }}</p>

              <div style="margin-top: 12px; padding-top: 24px; border-top: 1px solid #F1F5F9; display: flex; justify-content: flex-end;">
                <button type="submit" :disabled="isSaving" style="padding: 10px 24px; font-size: 13px; font-weight: 600; color: #fff; background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(99,102,241,0.35); transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px;" @mouseover="!isSaving && (($event.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(99,102,241,0.45)', ($event.currentTarget as HTMLElement).style.transform = 'translateY(-1px)')" @mouseleave="!isSaving && (($event.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(99,102,241,0.35)', ($event.currentTarget as HTMLElement).style.transform = 'translateY(0)')">
                  <svg v-if="isSaving" style="animation: spin 1s linear infinite;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg><svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>{{ isSaving ? 'Saving Changes...' : 'Save Email Settings' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div v-else-if="activeTab === 'security'" class="animate-slide-up" style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; box-shadow: 0 1px 4px rgba(15,23,42,0.05); animation-delay: 50ms;">
          <div style="padding: 20px 24px; border-bottom: 1px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;">Security & Authentication</h2>
            <div v-if="saveSuccess" style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #10B981; background: #ECFDF5; padding: 4px 12px; border-radius: 999px; animation: fade-in 0.3s;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Settings Saved</div>
          </div>
          <div style="padding: 24px;">
            <form @submit.prevent="saveSettings" style="display: flex; flex-direction: column; gap: 24px; max-width: 600px;">
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">Min Password Length</label>
                <input type="number" v-model="formData.passwordMinLength" placeholder="8" style="width: 100%; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box;" @focus="onFocus" @blur="onBlur">
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">Session Timeout (Minutes)</label>
                <input type="number" v-model="formData.sessionTimeoutMinutes" placeholder="60" style="width: 100%; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box;" @focus="onFocus" @blur="onBlur">
              </div>
              <div style="display:flex; align-items:center; gap: 12px; margin-top:8px;">
                <input type="checkbox" id="mfa" v-model="formData.enforceMfa" style="width:16px; height:16px; cursor:pointer;">
                <label for="mfa" style="font-size: 14px; font-weight: 500; color: #0F172A; cursor:pointer;">Enforce Multi-Factor Authentication (MFA)</label>
              </div>
              <div style="margin-top: 12px; padding-top: 24px; border-top: 1px solid #F1F5F9; display: flex; justify-content: flex-end;">
                <button type="submit" :disabled="isSaving" style="padding: 10px 24px; font-size: 13px; font-weight: 600; color: #fff; background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(99,102,241,0.35); transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px;" @mouseover="!isSaving && (($event.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(99,102,241,0.45)', ($event.currentTarget as HTMLElement).style.transform = 'translateY(-1px)')" @mouseleave="!isSaving && (($event.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(99,102,241,0.35)', ($event.currentTarget as HTMLElement).style.transform = 'translateY(0)')">
                  <svg v-if="isSaving" style="animation: spin 1s linear infinite;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg><svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>{{ isSaving ? 'Saving Changes...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div v-else-if="activeTab === 'business_hours'" class="animate-slide-up" style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; box-shadow: 0 1px 4px rgba(15,23,42,0.05); animation-delay: 50ms;">
          <div style="padding: 20px 24px; border-bottom: 1px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;">Business Hours</h2>
            <div v-if="saveSuccess" style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #10B981; background: #ECFDF5; padding: 4px 12px; border-radius: 999px; animation: fade-in 0.3s;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Settings Saved</div>
          </div>
          <div style="padding: 24px;">
            <form @submit.prevent="saveSettings" style="display: flex; flex-direction: column; gap: 24px; max-width: 600px;">
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                <div>
                  <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">Business Start Time</label>
                  <input type="time" v-model="formData.businessStartHour" style="width: 100%; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box;" @focus="onFocus" @blur="onBlur">
                </div>
                <div>
                  <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">Business End Time</label>
                  <input type="time" v-model="formData.businessEndHour" style="width: 100%; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box;" @focus="onFocus" @blur="onBlur">
                </div>
              </div>
              <div style="margin-top: 12px; padding-top: 24px; border-top: 1px solid #F1F5F9; display: flex; justify-content: flex-end;">
                <button type="submit" :disabled="isSaving" style="padding: 10px 24px; font-size: 13px; font-weight: 600; color: #fff; background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(99,102,241,0.35); transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px;" @mouseover="!isSaving && (($event.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(99,102,241,0.45)', ($event.currentTarget as HTMLElement).style.transform = 'translateY(-1px)')" @mouseleave="!isSaving && (($event.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(99,102,241,0.35)', ($event.currentTarget as HTMLElement).style.transform = 'translateY(0)')">
                  <svg v-if="isSaving" style="animation: spin 1s linear infinite;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg><svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>{{ isSaving ? 'Saving Changes...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div v-else-if="activeTab === 'ticket_fields'" class="animate-slide-up" style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; box-shadow: 0 1px 4px rgba(15,23,42,0.05); animation-delay: 50ms;">
          <div style="padding: 20px 24px; border-bottom: 1px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;">Ticket Form Fields</h2>
            <div v-if="saveSuccess" style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #10B981; background: #ECFDF5; padding: 4px 12px; border-radius: 999px; animation: fade-in 0.3s;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Settings Saved</div>
          </div>
          <div style="padding: 24px;">
            <form @submit.prevent="saveSettings" style="display: flex; flex-direction: column; gap: 24px; max-width: 600px;">
              <div style="display:flex; align-items:center; gap: 12px;">
                <input type="checkbox" id="cat-field" v-model="formData.showCategoryField" style="width:16px; height:16px; cursor:pointer;">
                <label for="cat-field" style="font-size: 14px; font-weight: 500; color: #0F172A; cursor:pointer;">Show "Category" field when users create tickets</label>
              </div>
              <div style="display:flex; align-items:center; gap: 12px;">
                <input type="checkbox" id="asset-field" v-model="formData.showAssetField" style="width:16px; height:16px; cursor:pointer;">
                <label for="asset-field" style="font-size: 14px; font-weight: 500; color: #0F172A; cursor:pointer;">Show "Associated Asset" field when users create tickets</label>
              </div>
              <div style="display:flex; align-items:center; gap: 12px;">
                <input type="checkbox" id="guest-ticket" v-model="formData.allowGuestTickets" style="width:16px; height:16px; cursor:pointer;">
                <label for="guest-ticket" style="font-size: 14px; font-weight: 500; color: #0F172A; cursor:pointer;">Allow Guest Users to submit tickets</label>
              </div>
              <div style="margin-top: 12px; padding-top: 24px; border-top: 1px solid #F1F5F9; display: flex; justify-content: flex-end;">
                <button type="submit" :disabled="isSaving" style="padding: 10px 24px; font-size: 13px; font-weight: 600; color: #fff; background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(99,102,241,0.35); transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px;" @mouseover="!isSaving && (($event.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(99,102,241,0.45)', ($event.currentTarget as HTMLElement).style.transform = 'translateY(-1px)')" @mouseleave="!isSaving && (($event.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(99,102,241,0.35)', ($event.currentTarget as HTMLElement).style.transform = 'translateY(0)')">
                  <svg v-if="isSaving" style="animation: spin 1s linear infinite;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg><svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>{{ isSaving ? 'Saving Changes...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes fade-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
