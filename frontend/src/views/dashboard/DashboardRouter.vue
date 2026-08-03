<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const role = computed(() => authStore.user?.role)

// Lazy load dashboards based on role
const AdminDashboard = defineAsyncComponent(() => import('./AdminDashboard.vue'))
const AgentDashboard = defineAsyncComponent(() => import('./AgentDashboard.vue'))
const EmployeeDashboard = defineAsyncComponent(() => import('./EmployeeDashboard.vue'))

const currentDashboard = computed(() => {
  if (role.value === 'System Administrator' || role.value === 'Company Administrator') {
    return AdminDashboard
  }
  if (
    role.value === 'Support Agent' ||
    role.value === 'IT Support Agent' ||
    role.value === 'Senior Agent' ||
    role.value === 'IT Manager' ||
    role.value === 'CISO / ISB' ||
    role.value === 'Security Manager'
  ) {
    return AgentDashboard
  }
  return EmployeeDashboard
})
</script>

<template>
  <component :is="currentDashboard" />
</template>
