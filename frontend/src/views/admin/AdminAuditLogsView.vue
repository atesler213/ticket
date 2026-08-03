<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { AuditLogService } from '../../services/OtherServices'
import type { AuditLog } from '../../types/AuditLog'
import { formatDistanceToNow } from 'date-fns'

const logs = ref<AuditLog[]>([])
const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  try {
    logs.value = await AuditLogService.getAll()
  } finally {
    isLoading.value = false
  }
})

const sortedLogs = computed(() => {
  return [...logs.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

function timeAgo(value: string) {
  return formatDistanceToNow(new Date(value), { addSuffix: true })
}
</script>

<template>
  <div>
    <div class="mb-6 animate-slide-up">
      <h1 class="text-2xl font-bold text-gray-900">Audit Logs</h1>
      <p class="text-gray-500 mt-1">Track authentication events, privileged access, and ticket workflow operations.</p>
    </div>

    <div class="table-container animate-slide-up" style="animation-delay: 40ms;">
      <table class="table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Target</th>
            <th>Details</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="6" class="text-center py-8 text-gray-400">Loading audit events...</td>
          </tr>
          <tr v-else-if="sortedLogs.length === 0">
            <td colspan="6" class="text-center py-8 text-gray-400">No audit logs found.</td>
          </tr>
          <tr v-else v-for="item in sortedLogs" :key="item.id">
            <td>
              <div class="text-sm text-gray-800">{{ new Date(item.createdAt).toLocaleString() }}</div>
              <div class="text-xs text-gray-500">{{ timeAgo(item.createdAt) }}</div>
            </td>
            <td>
              <div class="font-medium text-gray-900">{{ item.actorId }}</div>
              <div class="text-xs text-gray-500">{{ item.actorRole }}</div>
            </td>
            <td><span class="badge badge-pending">{{ item.action }}</span></td>
            <td>{{ item.targetType }} / {{ item.targetId }}</td>
            <td class="text-sm text-gray-700">{{ item.details }}</td>
            <td class="text-sm text-gray-500">{{ item.ipAddress }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
