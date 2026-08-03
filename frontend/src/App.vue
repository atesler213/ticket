<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useTenantStore } from './stores/tenant'

const tenantStore = useTenantStore()

onMounted(async () => {
  // In a real app, this would fetch from an API based on the subdomain
  await tenantStore.fetchTenantConfiguration()
})
</script>

<template>
  <RouterView />
</template>

<style>
/* Any global resets not covered by Tailwind */
</style>
