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
      <div class="card card-no-hover animate-slide-up" style="height:400px;display:flex;flex-direction:column;">
        <div class="card-header" style="padding:20px;border-bottom:1px solid #F1F5F9;">
          <h3 class="text-[15px] font-semibold text-gray-900">IT Asset Spend by Department</h3>
        </div>
        <div class="card-body flex-1" style="padding:20px;display:flex;align-items:center;justify-content:center;background:#F8FAFC;margin:20px;border-radius:8px;border:1px dashed #E2E8F0;">
          <div class="text-gray-400 flex flex-col items-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mb-2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span class="text-sm font-medium">[Bar Chart Placeholder: IT Spend]</span>
          </div>
        </div>
      </div>

      <!-- Agent Performance Tracking -->
      <div class="card card-no-hover animate-slide-up" style="animation-delay: 50ms;height:400px;display:flex;flex-direction:column;">
        <div class="card-header" style="padding:20px;border-bottom:1px solid #F1F5F9;">
          <h3 class="text-[15px] font-semibold text-gray-900">Agent Performance (CSAT)</h3>
        </div>
        <div class="card-body flex-1" style="padding:20px;display:flex;align-items:center;justify-content:center;background:#F8FAFC;margin:20px;border-radius:8px;border:1px dashed #E2E8F0;">
          <div class="text-gray-400 flex flex-col items-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mb-2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            <span class="text-sm font-medium">[Scatter Plot Placeholder: CSAT Score]</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card card-no-hover animate-slide-up mt-6" style="animation-delay: 100ms;">
      <div class="card-header" style="padding:20px;border-bottom:1px solid #F1F5F9;">
        <h3 class="text-[15px] font-semibold text-gray-900">CAPA Management Review (Clause 9.3 / 10.2)</h3>
      </div>
      <div class="card-body" style="padding:20px;">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div class="p-4 rounded-lg border border-gray-200 bg-white">
            <div class="text-xs uppercase font-semibold text-gray-500">Open</div>
            <div class="text-2xl font-bold text-blue-700 mt-1">{{ capaStats.open }}</div>
          </div>
          <div class="p-4 rounded-lg border border-gray-200 bg-white">
            <div class="text-xs uppercase font-semibold text-gray-500">Delayed</div>
            <div class="text-2xl font-bold text-amber-700 mt-1">{{ capaStats.delayed }}</div>
          </div>
          <div class="p-4 rounded-lg border border-gray-200 bg-white">
            <div class="text-xs uppercase font-semibold text-gray-500">Verified</div>
            <div class="text-2xl font-bold text-emerald-700 mt-1">{{ capaStats.verified }}</div>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>CAPA ID</th>
              <th>Incident Ticket</th>
              <th>RCA Method</th>
              <th>Owner</th>
              <th>Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in capaRecords" :key="item.id">
              <td class="font-medium text-gray-900">{{ item.id }}</td>
              <td>{{ item.ticketId }}</td>
              <td>{{ item.rootCauseMethod }}</td>
              <td>{{ item.owner }}</td>
              <td>{{ new Date(item.dueAt).toLocaleDateString() }}</td>
              <td>
                <span v-if="item.status === 'Open'" class="badge badge-open">Open</span>
                <span v-else-if="item.status === 'Delayed'" class="badge badge-pending">Delayed</span>
                <span v-else class="badge badge-resolved">Verified</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
