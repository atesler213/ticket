<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const isSent = ref(false)
const loading = ref(false)

async function handleReset() {
  loading.value = true
  try {
    // Mock API call to reset password
    await new Promise(resolve => setTimeout(resolve, 600))
    isSent.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
    <div class="w-full max-w-md p-6">
      <div class="text-center mb-8 animate-slide-up">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Reset your password</h1>
        <p class="text-sm text-gray-500 mt-1">Enter your email and we'll send you a reset link.</p>
      </div>

      <div class="card card-no-hover animate-slide-up" style="animation-delay: 50ms; padding: 32px;">
        <div v-if="isSent" class="text-center">
          <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Check your email</h3>
          <p class="text-sm text-gray-500 mb-6">We've sent a password reset link to {{ email }}.</p>
          <router-link :to="{ name: 'login' }" class="btn btn-primary w-full justify-center">Return to login</router-link>
        </div>

        <form v-else @submit.prevent="handleReset" class="space-y-5">
          <div>
            <label class="form-label" for="email">Email address</label>
            <input v-model="email" type="email" id="email" class="form-input" placeholder="name@techcorp.com" required>
          </div>
          
          <button type="submit" class="btn btn-primary w-full justify-center text-base h-[44px]" :disabled="loading">
            {{ loading ? 'Sending...' : 'Send reset link' }}
          </button>
        </form>

        <div v-if="!isSent" class="mt-6 text-center">
          <router-link :to="{ name: 'login' }" class="text-sm font-medium text-gray-500 hover:text-gray-900 inline-flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
