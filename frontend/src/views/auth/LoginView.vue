<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const otpCode = ref('')
const loading = ref(false)
const authError = ref('')

async function handleLogin() {
  loading.value = true
  authError.value = ''
  try {
    await authStore.login(email.value, password.value)
    if (!authStore.mfaRequired) {
      router.push({ name: 'dashboard' })
    }
  } catch (error) {
    authError.value = error instanceof Error ? error.message : 'Authentication failed'
  } finally {
    loading.value = false
  }
}

async function handleMfaVerify() {
  loading.value = true
  authError.value = ''
  try {
    await authStore.verifyMfa(otpCode.value)
    router.push({ name: 'dashboard' })
  } catch (error) {
    authError.value = error instanceof Error ? error.message : 'MFA verification failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
    <div class="w-full max-w-md p-6">
      <div class="text-center mb-8 animate-slide-up">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">TechCorp Support</h1>
        <p class="text-sm text-gray-500 mt-1">Sign in to your account</p>
      </div>

      <div class="card card-no-hover animate-slide-up" style="animation-delay: 50ms; padding: 32px;">
        <form v-if="!authStore.mfaRequired" @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="form-label" for="email">Email address</label>
            <input v-model="email" type="email" id="email" class="form-input" placeholder="name@techcorp.com" required>
          </div>
          
          <div>
            <div class="flex items-center justify-between">
              <label class="form-label" for="password" style="margin-bottom:0;">Password</label>
              <a href="#" class="text-sm font-medium text-blue-600 hover:text-blue-500">Forgot password?</a>
            </div>
            <input v-model="password" type="password" id="password" class="form-input mt-1.5" required>
          </div>

          <div class="flex items-center">
            <input type="checkbox" id="remember" class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600">
            <label for="remember" class="ml-2 block text-sm text-gray-700">Remember me for 30 days</label>
          </div>

          <button type="submit" class="btn btn-primary w-full justify-center text-base h-[44px]" :disabled="loading">
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <form v-else @submit.prevent="handleMfaVerify" class="space-y-5">
          <div>
            <label class="form-label" for="otp">MFA Code</label>
            <input v-model="otpCode" type="text" id="otp" class="form-input" placeholder="Enter 6-digit code" required>
            <p class="text-xs text-gray-500 mt-2">Privileged accounts require TOTP/WebAuthn verification.</p>
          </div>
          <button type="submit" class="btn btn-primary w-full justify-center text-base h-[44px]" :disabled="loading">
            {{ loading ? 'Verifying...' : 'Verify MFA' }}
          </button>
        </form>

        <div v-if="authError" class="mt-4 text-sm text-red-600">{{ authError }}</div>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200"></div></div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <div class="mt-6">
            <button class="btn btn-secondary w-full justify-center text-base h-[44px] bg-white">
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Single Sign-On (SSO)
            </button>
          </div>
          <div class="mt-6">
            <div class="text-sm font-medium text-gray-500 mb-3 text-center">Demo Accounts</div>
            <div class="flex gap-2 justify-center">
              <button @click.prevent="email='admin@test.com'; password='password'; handleLogin()" type="button" class="px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200">Admin</button>
              <button @click.prevent="email='agent@test.com'; password='password'; handleLogin()" type="button" class="px-3 py-1.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200">Agent</button>
              <button @click.prevent="email='employee@test.com'; password='password'; handleLogin()" type="button" class="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200">Employee</button>
              <button @click.prevent="email='isb@company.de'; password='password'; handleLogin()" type="button" class="px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200">CISO</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
