<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { CapaService } from '../../services/OtherServices'
import type { CapaRecord } from '../../types/Capa'

const activeQuarter = ref('Q2')
const selectedYear = ref('2025')
const capaRecords = ref<CapaRecord[]>([])

onMounted(async () => {
  capaRecords.value = await CapaService.getAll()
})

const capaStats = computed(() => {
  return {
    open: capaRecords.value.filter(x => x.status === 'Open').length,
    delayed: capaRecords.value.filter(x => x.status === 'Delayed').length,
    verified: capaRecords.value.filter(x => x.status === 'Verified').length
  }
})

function capaBadge(status: CapaRecord['status']) {
  if (status === 'Open') return 'background:#EFF6FF;color:#1D4ED8;border-color:#BFDBFE;'
  if (status === 'Delayed') return 'background:#FFF7ED;color:#B45309;border-color:#FED7AA;'
  return 'background:#ECFDF5;color:#047857;border-color:#A7F3D0;'
}
</script>

<template>
  <div>
    <!-- Date Range Filter -->
    <div class="flex justify-between items-center mb-6 animate-slide-up">
      <div class="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
        <button 
          v-for="q in ['Q1', 'Q2', 'Q3', 'Q4']" :key="q"
          @click="activeQuarter = q"
          class="px-4 py-1.5 text-sm font-medium rounded-md transition-colors"
          :class="activeQuarter === q ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'"
        >
          {{ q }}{{ q === 'Q2' ? ' (Current)' : '' }}
        </button>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-500">Year:</span>
        <select v-model="selectedYear" class="form-select bg-white border border-gray-300 rounded-md shadow-sm text-sm" style="height:36px;width:100px;padding: 0 10px;outline:none;">
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
        
        <button class="btn btn-secondary h-9 ml-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> 
          Download PDF
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6 stagger">
      <!-- Department Cost Tracking -->
      <div
        class="card card-no-hover animate-slide-up"
        style="
          height:400px;
          display:flex;
          flex-direction:column;
          box-shadow:0 10px 28px rgba(15,23,42,0.08);
          border:1px solid #E2E8F0;
        "
      >
        <div class="card-header" style="padding:20px;border-bottom:1px solid #F1F5F9;background:linear-gradient(180deg,#FFFFFF 0%,#FAFBFF 100%);">
          <h3 class="text-[15px] font-semibold text-gray-900">IT Asset Spend by Department</h3>
        </div>
        <div
          class="card-body flex-1"
          style="
            padding:20px;
            display:flex;
            align-items:center;
            justify-content:center;
            background:radial-gradient(120% 120% at 10% 10%,#EEF2FF 0%,#F8FAFC 45%,#FFFFFF 100%);
            margin:20px;
            border-radius:10px;
            border:1px dashed #CBD5E1;
            transition:all .2s;
          "
          @mouseover="($event.currentTarget as HTMLElement).style.transform='translateY(-2px)';($event.currentTarget as HTMLElement).style.boxShadow='0 10px 24px rgba(79,70,229,0.10)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.transform='translateY(0)';($event.currentTarget as HTMLElement).style.boxShadow='none'"
        >
          <div class="text-gray-500 flex flex-col items-center">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mb-2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span class="text-sm font-medium">[Bar Chart Placeholder: IT Spend]</span>
          </div>
        </div>
      </div>

      <!-- Agent Performance Tracking -->
      <div
        class="card card-no-hover animate-slide-up"
        style="
          animation-delay: 50ms;
          height:400px;
          display:flex;
          flex-direction:column;
          box-shadow:0 10px 28px rgba(15,23,42,0.08);
          border:1px solid #E2E8F0;
        "
      >
        <div class="card-header" style="padding:20px;border-bottom:1px solid #F1F5F9;background:linear-gradient(180deg,#FFFFFF 0%,#F7FEFF 100%);">
          <h3 class="text-[15px] font-semibold text-gray-900">Agent Performance (CSAT)</h3>
        </div>
        <div
          class="card-body flex-1"
          style="
            padding:20px;
            display:flex;
            align-items:center;
            justify-content:center;
            background:radial-gradient(120% 120% at 10% 10%,#ECFEFF 0%,#F8FAFC 45%,#FFFFFF 100%);
            margin:20px;
            border-radius:10px;
            border:1px dashed #CBD5E1;
            transition:all .2s;
          "
          @mouseover="($event.currentTarget as HTMLElement).style.transform='translateY(-2px)';($event.currentTarget as HTMLElement).style.boxShadow='0 10px 24px rgba(6,182,212,0.10)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.transform='translateY(0)';($event.currentTarget as HTMLElement).style.boxShadow='none'"
        >
          <div class="text-gray-500 flex flex-col items-center">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mb-2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            <span class="text-sm font-medium">[Scatter Plot Placeholder: CSAT Score]</span>
          </div>
        </div>
      </div>
    </div>

    <div
      class="card card-no-hover animate-slide-up mt-6"
      style="
        animation-delay: 100ms;
        border:1px solid #E2E8F0;
        box-shadow:0 12px 34px rgba(15,23,42,0.09);
      "
    >
      <div class="card-header" style="padding:20px;border-bottom:1px solid #F1F5F9;background:linear-gradient(180deg,#FFFFFF 0%,#FAFBFF 100%);">
        <h3 class="text-[15px] font-semibold text-gray-900">CAPA Management Review (Clause 9.3 / 10.2)</h3>
      </div>
      <div class="card-body" style="padding:20px;">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div
            style="
              background:#fff;border:1px solid #E2E8F0;border-radius:12px;
              padding:16px 20px;display:flex;align-items:center;gap:16px;
              box-shadow:0 2px 10px rgba(15,23,42,0.04);
              transition:all 0.2s;cursor:default;
            "
            @mouseover="($event.currentTarget as HTMLElement).style.transform='translateY(-2px)'; ($event.currentTarget as HTMLElement).style.boxShadow='0 8px 24px rgba(59,130,246,0.12)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.transform='translateY(0)'; ($event.currentTarget as HTMLElement).style.boxShadow='0 2px 10px rgba(15,23,42,0.04)'"
          >
            <div style="width:48px;height:48px;border-radius:12px;background:#EFF6FF;display:flex;align-items:center;justify-content:center;color:#3B82F6;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div>
              <div class="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Open</div>
              <div class="text-2xl font-extrabold text-gray-900 leading-none">{{ capaStats.open }}</div>
            </div>
          </div>

          <div
            style="
              background:#fff;border:1px solid #E2E8F0;border-radius:12px;
              padding:16px 20px;display:flex;align-items:center;gap:16px;
              box-shadow:0 2px 10px rgba(15,23,42,0.04);
              transition:all 0.2s;cursor:default;
            "
            @mouseover="($event.currentTarget as HTMLElement).style.transform='translateY(-2px)'; ($event.currentTarget as HTMLElement).style.boxShadow='0 8px 24px rgba(245,158,11,0.12)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.transform='translateY(0)'; ($event.currentTarget as HTMLElement).style.boxShadow='0 2px 10px rgba(15,23,42,0.04)'"
          >
            <div style="width:48px;height:48px;border-radius:12px;background:#FFFBEB;display:flex;align-items:center;justify-content:center;color:#F59E0B;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <div class="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Delayed</div>
              <div class="text-2xl font-extrabold text-gray-900 leading-none">{{ capaStats.delayed }}</div>
            </div>
          </div>

          <div
            style="
              background:#fff;border:1px solid #E2E8F0;border-radius:12px;
              padding:16px 20px;display:flex;align-items:center;gap:16px;
              box-shadow:0 2px 10px rgba(15,23,42,0.04);
              transition:all 0.2s;cursor:default;
            "
            @mouseover="($event.currentTarget as HTMLElement).style.transform='translateY(-2px)'; ($event.currentTarget as HTMLElement).style.boxShadow='0 8px 24px rgba(16,185,129,0.12)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.transform='translateY(0)'; ($event.currentTarget as HTMLElement).style.boxShadow='0 2px 10px rgba(15,23,42,0.04)'"
          >
            <div style="width:48px;height:48px;border-radius:12px;background:#ECFDF5;display:flex;align-items:center;justify-content:center;color:#10B981;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <div class="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Verified</div>
              <div class="text-2xl font-extrabold text-gray-900 leading-none">{{ capaStats.verified }}</div>
            </div>
          </div>
        </div>

        <div style="border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;">
          <div style="display:grid;grid-template-columns:120px 170px 140px 1fr 130px 130px;padding:12px 16px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;font-size:11px;font-weight:700;color:#64748B;letter-spacing:.08em;text-transform:uppercase;">
            <div>CAPA ID</div>
            <div>Incident Ticket</div>
            <div>RCA Method</div>
            <div>Owner</div>
            <div>Due</div>
            <div>Status</div>
          </div>

          <div
            v-for="(item, idx) in capaRecords"
            :key="item.id"
            :style="`
              display:grid;
              grid-template-columns:120px 170px 140px 1fr 130px 130px;
              padding:13px 16px;
              align-items:center;
              border-bottom:${idx < capaRecords.length - 1 ? '1px solid #F1F5F9' : 'none'};
              transition:background .15s;
            `"
            @mouseover="($event.currentTarget as HTMLElement).style.background='#FAFBFF'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background='transparent'"
          >
            <div class="font-semibold text-gray-900">{{ item.id }}</div>
            <div class="text-gray-700">{{ item.ticketId }}</div>
            <div class="text-gray-700">{{ item.rootCauseMethod }}</div>
            <div class="text-gray-700">{{ item.owner }}</div>
            <div class="text-gray-600">{{ new Date(item.dueAt).toLocaleDateString() }}</div>
            <div>
              <span
                :style="`
                  display:inline-flex;
                  align-items:center;
                  padding:4px 10px;
                  border-radius:999px;
                  border:1px solid;
                  font-size:11px;
                  font-weight:700;
                  ${capaBadge(item.status)}
                `"
              >
                {{ item.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
