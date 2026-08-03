<script setup lang="ts">
import Sidebar from '../components/common/Sidebar.vue'
import Topbar from '../components/common/Topbar.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="layout">
    <Sidebar />
    <main class="main-content">
      <Topbar />
      <div class="content">
        <!-- Route transitions can be added here later -->
        <RouterView />
      </div>
    </main>
  </div>
</template>
