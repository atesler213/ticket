<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { IntegrationService } from '../../services/OtherServices'
import type { IntegrationConfig } from '../../types/Integration'

const items = ref<IntegrationConfig[]>([])
const isLoading = ref(false)

onMounted(async () => {
  await fetchItems()
})

async function fetchItems() {
  isLoading.value = true
  try {
    items.value = await IntegrationService.getAll()
  } finally {
    isLoading.value = false
  }
}

const connectedCount = computed(() => items.value.filter(x => x.status === 'Connected').length)
const degradedCount = computed(() => items.value.filter(x => x.status === 'Degraded').length)

async function toggleIntegration(item: IntegrationConfig) {
  const newStatus = item.status === 'Disconnected' ? 'Connected' : 'Disconnected'
  try {
    const updated = await IntegrationService.update(item.id, { ...item, status: newStatus, lastSyncAt: new Date().toISOString() })
    const idx = items.value.findIndex(x => x.id === item.id)
    if (idx !== -1) {
      items.value[idx] = updated
    }
  } catch (error) {
    console.error('Failed to toggle integration', error)
  }
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;" class="animate-slide-up">
      <div>
        <h1 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px 0;">Integrations</h1>
        <p style="font-size: 13px; color: #64748B; margin: 0;">SSO, ITAM, SIEM and NTP integration health for ISO evidence readiness.</p>
      </div>
    </div>

    <!-- KPI Stats -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;" class="stagger">
      <div
        v-for="(stat, i) in [
          { label: 'Total Integrations', value: items.length, icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1', color: '#6366F1', bg: '#EEF2FF' },
          { label: 'Connected', value: connectedCount, icon: 'M5 13l4 4L19 7', color: '#10B981', bg: '#ECFDF5' },
          { label: 'Degraded', value: degradedCount, icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: '#F59E0B', bg: '#FFF7ED' }
        ]"
        :key="i"
        class="animate-slide-up"
        style="
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 1px 4px rgba(15,23,42,0.05);
          transition: box-shadow 0.2s, transform 0.2s;
        "
        @mouseover="($event.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(15,23,42,0.09)'; ($event.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'"
        @mouseleave="($event.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(15,23,42,0.05)'; ($event.currentTarget as HTMLElement).style.transform = 'translateY(0)'"
      >
        <div :style="`width: 40px; height: 40px; border-radius: 10px; background: ${stat.bg}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="stat.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path :d="stat.icon"/>
          </svg>
        </div>
        <div>
          <div style="font-size: 24px; font-weight: 800; color: #0F172A; line-height: 1;">{{ stat.value }}</div>
          <div style="font-size: 12px; color: #64748B; margin-top: 2px; font-weight: 500;">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- Integrations List -->
    <div
      class="animate-slide-up"
      style="
        background: #fff; border: 1px solid #E2E8F0; border-radius: 12px;
        overflow: hidden; box-shadow: 0 1px 4px rgba(15,23,42,0.05);
      "
    >
      <div v-if="isLoading" style="text-align: center; padding: 60px 0; color: #94A3B8;">
        <svg style="animation: spin 1s linear infinite; margin: 0 auto 12px; display: block;" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        <p style="font-size: 14px; margin: 0;">Loading integrations...</p>
      </div>
      
      <div v-else-if="items.length === 0" style="text-align: center; padding: 60px 20px;">
        <p style="color: #94A3B8; font-size: 14px; margin: 0;">No integrations configured.</p>
      </div>
      
      <div v-else style="display: flex; flex-direction: column;">
        <div
          v-for="(item, idx) in items"
          :key="item.id"
          :style="`
            padding: 20px;
            display: flex; align-items: center; justify-content: space-between;
            border-bottom: ${idx < items.length - 1 ? '1px solid #F1F5F9' : 'none'};
            transition: background 0.15s;
          `"
          @mouseover="($event.currentTarget as HTMLElement).style.background = '#FAFBFF'"
          @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'"
        >
          <!-- Info -->
          <div style="display: flex; align-items: flex-start; gap: 16px; flex: 1;">
            <div :style="`
              width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
              background: ${item.status === 'Connected' ? '#EEF2FF' : '#F1F5F9'};
              display: flex; align-items: center; justify-content: center;
              border: 1px solid ${item.status === 'Connected' ? '#C7D2FE' : '#E2E8F0'};
            `">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="item.status === 'Connected' ? '#6366F1' : '#94A3B8'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
            </div>
            
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                <h3 style="font-size: 15px; font-weight: 700; color: #0F172A; margin: 0;">{{ item.name }}</h3>
                <span :style="`
                  font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px;
                  ${item.status === 'Connected' ? 'color: #16A34A; background: #DCFCE7;' :
                    item.status === 'Degraded' ? 'color: #D97706; background: #FEF3C7;' :
                    'color: #64748B; background: #F1F5F9;'}
                `">
                  {{ item.status }}
                </span>
                <span style="font-size: 11px; font-weight: 600; color: #64748B; background: #F8FAFC; padding: 2px 8px; border-radius: 999px; border: 1px solid #E2E8F0;">
                  {{ item.type }}
                </span>
              </div>
              <p style="font-size: 13px; color: #64748B; margin: 0 0 8px 0; max-width: 600px; line-height: 1.5;">
                {{ item.notes }}
              </p>
              <div style="display: flex; align-items: center; gap: 16px; font-size: 12px; color: #94A3B8;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                  {{ item.endpoint }}
                </div>
                <div v-if="item.lastSyncAt" style="display: flex; align-items: center; gap: 4px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Last Sync: {{ new Date(item.lastSyncAt).toLocaleString() }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div style="margin-left: 20px;">
            <button
              style="
                padding: 8px 16px; font-size: 13px; font-weight: 600; border-radius: 8px; cursor: pointer;
                transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; border: 1px solid transparent;
                ${item.status === 'Disconnected' 
                  ? 'background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); color: #fff; box-shadow: 0 2px 8px rgba(99,102,241,0.3);' 
                  : 'background: #fff; color: #EF4444; border-color: #FECACA;'}
              "
              @mouseover="($event.currentTarget as HTMLElement).style.boxShadow = item.status === 'Disconnected' ? '0 4px 12px rgba(99,102,241,0.4)' : '0 2px 8px rgba(239,68,68,0.15)'; ($event.currentTarget as HTMLElement).style.background = item.status === 'Disconnected' ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' : '#FEF2F2'"
              @mouseleave="($event.currentTarget as HTMLElement).style.boxShadow = item.status === 'Disconnected' ? '0 2px 8px rgba(99,102,241,0.3)' : 'none'; ($event.currentTarget as HTMLElement).style.background = item.status === 'Disconnected' ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' : '#fff'"
              @click="toggleIntegration(item)"
            >
              <svg v-if="item.status === 'Disconnected'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
              {{ item.status === 'Disconnected' ? 'Connect Integration' : 'Disconnect' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
