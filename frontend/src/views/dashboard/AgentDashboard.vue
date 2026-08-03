<script setup lang="ts">
import KpiCard from '../../components/common/KpiCard.vue'
</script>

<template>
  <div>
    <div class="grid grid-cols-4 gap-6 mb-6 stagger">
      <KpiCard title="Active Tickets" value="28" :trend="12" />
      <KpiCard title="Unassigned" value="5" :trend="-2" />
      <KpiCard title="Avg Resolution Time" value="4h 12m" :trend="-15" />
      <KpiCard title="CSAT Score" value="98%" :trend="2" />
    </div>
    
    <div class="card card-no-hover">
      <div class="card-header border-b border-gray-100 p-5">
        <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div class="p-8 text-center text-gray-500">
        Agent Dashboard loaded successfully. Data grid implementation pending.
      </div>
    </div>
  </div>
</template>
