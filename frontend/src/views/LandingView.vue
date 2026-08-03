<template>
  <div class="landing-page bg-slate-900 min-h-screen text-white font-sans overflow-x-hidden selection:bg-blue-500/30">
    <!-- Navbar -->
    <nav class="fixed w-full z-50 transition-all duration-300" :class="{ 'bg-slate-900/80 backdrop-blur-md shadow-lg border-b border-white/5': scrolled, 'bg-transparent': !scrolled }">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 tracking-tight">TechCorp ITSM</span>
          </div>
          <div class="hidden md:flex items-center gap-8">
            <a href="#" class="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#" class="text-sm font-medium text-slate-300 hover:text-white transition-colors">Solutions</a>
            <a href="#" class="text-sm font-medium text-slate-300 hover:text-white transition-colors">Pricing</a>
          </div>
          <div class="flex items-center gap-4">
            <router-link :to="{ name: 'login' }" class="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign in</router-link>
            <router-link :to="{ name: 'login' }" class="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5">Get Started</router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <main class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8 animate-fade-in-up">
          <span class="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          IT Service Management Reimagined
        </div>
        
        <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 animate-fade-in-up animation-delay-100 leading-tight">
          Resolve issues <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">faster</span>.<br/> Empower your team.
        </h1>
        
        <p class="mt-6 text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 animate-fade-in-up animation-delay-200 leading-relaxed">
          The all-in-one platform for IT support, asset management, and SLA tracking. Streamline your operations with an intuitive, powerful, and intelligent dashboard.
        </p>
        
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
          <router-link :to="{ name: 'login' }" class="w-full sm:w-auto text-base font-semibold bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-full shadow-xl shadow-white/10 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
            Start your free trial
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </router-link>
          <a href="#" class="w-full sm:w-auto text-base font-semibold bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white px-8 py-4 rounded-full transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
            Explore Features
          </a>
        </div>

        <!-- Dashboard Mockup Preview -->
        <div class="mt-20 relative mx-auto max-w-5xl animate-fade-in-up animation-delay-500 perspective-1000">
          <div class="rounded-2xl border border-slate-700/50 bg-slate-800/50 shadow-2xl p-2 backdrop-blur-sm transform rotate-x-12 hover:rotate-x-0 transition-all duration-700 ease-out">
            <div class="rounded-xl overflow-hidden bg-slate-900 border border-slate-700/50 flex flex-col">
              <!-- Mockup Header -->
              <div class="h-12 bg-slate-800/80 border-b border-slate-700/50 flex items-center px-4 gap-2">
                <div class="flex gap-1.5">
                  <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div class="mx-auto bg-slate-900 rounded-md px-3 py-1 text-xs text-slate-400 font-mono">ticket.techcorp.app</div>
              </div>
              <!-- Mockup Body (Abstracted Dashboard) -->
              <div class="flex h-[400px] md:h-[500px] text-left">
                <!-- Sidebar -->
                <div class="w-48 border-r border-slate-700/50 p-4 space-y-4 hidden md:block">
                  <div class="h-6 w-24 bg-slate-700/50 rounded mb-8"></div>
                  <div class="h-8 w-full bg-blue-600/20 rounded border border-blue-500/30"></div>
                  <div class="h-8 w-full bg-slate-700/30 rounded"></div>
                  <div class="h-8 w-full bg-slate-700/30 rounded"></div>
                  <div class="h-8 w-full bg-slate-700/30 rounded"></div>
                </div>
                <!-- Content -->
                <div class="flex-1 p-6 space-y-6 bg-slate-900/50">
                  <div class="flex justify-between items-center">
                    <div class="h-6 w-48 bg-slate-700/50 rounded"></div>
                    <div class="h-8 w-32 bg-blue-600/80 rounded-md"></div>
                  </div>
                  <!-- Cards -->
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="h-24 bg-slate-800/80 rounded-xl border border-slate-700/50 p-4 flex flex-col justify-between">
                      <div class="h-4 w-16 bg-slate-700 rounded"></div>
                      <div class="h-8 w-12 bg-slate-600 rounded"></div>
                    </div>
                    <div class="h-24 bg-slate-800/80 rounded-xl border border-slate-700/50 p-4 flex flex-col justify-between">
                      <div class="h-4 w-20 bg-slate-700 rounded"></div>
                      <div class="h-8 w-16 bg-slate-600 rounded"></div>
                    </div>
                    <div class="h-24 bg-slate-800/80 rounded-xl border border-slate-700/50 p-4 flex flex-col justify-between hidden md:flex">
                      <div class="h-4 w-24 bg-slate-700 rounded"></div>
                      <div class="h-8 w-10 bg-slate-600 rounded"></div>
                    </div>
                    <div class="h-24 bg-slate-800/80 rounded-xl border border-slate-700/50 p-4 flex flex-col justify-between hidden md:flex">
                      <div class="h-4 w-16 bg-slate-700 rounded"></div>
                      <div class="h-8 w-12 bg-slate-600 rounded"></div>
                    </div>
                  </div>
                  <!-- Table -->
                  <div class="flex-1 bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                    <div class="h-5 w-32 bg-slate-700 rounded mb-6"></div>
                    <div class="space-y-3">
                      <div class="h-10 w-full bg-slate-700/30 rounded"></div>
                      <div class="h-10 w-full bg-slate-700/30 rounded"></div>
                      <div class="h-10 w-full bg-slate-700/30 rounded"></div>
                      <div class="h-10 w-full bg-slate-700/30 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Glow under mockup -->
          <div class="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 blur-2xl opacity-20 -z-10 rounded-full"></div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)

const handleScroll = () => {
  scrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}
.animation-delay-100 { animation-delay: 100ms; }
.animation-delay-200 { animation-delay: 200ms; }
.animation-delay-300 { animation-delay: 300ms; }
.animation-delay-500 { animation-delay: 500ms; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.perspective-1000 {
  perspective: 1000px;
}
.rotate-x-12 {
  transform: rotateX(12deg) scale(0.95);
}
.hover\:rotate-x-0:hover {
  transform: rotateX(0deg) scale(1);
}
</style>
