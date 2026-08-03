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
  <div class="min-h-screen !flex !bg-slate-900 !text-white font-sans selection:bg-blue-500/30">
    <!-- Left side: Decorative / Branding -->
    <div class="!hidden lg:!flex lg:!w-1/2 relative !flex-col !justify-between !p-12 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
      
      <!-- Decorative glow -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div class="relative z-10 !flex !items-center !gap-3">
        <div class="!w-12 !h-12 !rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 !flex !items-center !justify-center !shadow-lg shadow-blue-500/30">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="!text-white">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </div>
        <span class="!text-3xl !font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 !tracking-tight">Hess Support</span>
      </div>

      <div class="relative z-10 max-w-md animate-fade-in-up">
        <h2 class="!text-4xl !font-extrabold !mb-6 !leading-tight !tracking-tight">Welcome to the future of IT Service Management</h2>
        <p class="!text-lg !text-slate-400">Log in to manage tickets, assets, and service requests efficiently and securely.</p>
      </div>

      <div class="relative z-10 !text-sm !text-slate-500">
        &copy; 2026 Hess Corporation. All rights reserved.
      </div>
    </div>

    <!-- Right side: Login Form -->
    <div class="!w-full lg:!w-1/2 !flex !flex-col !items-center !justify-center !p-6 lg:!p-12 relative overflow-y-auto">
      <!-- Glow behind the form for mobile/tablet -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none lg:!hidden"></div>

      <!-- Header & Logo outside the card for mobile (hidden on desktop to fix redundancy) -->
      <div class="lg:!hidden !flex !flex-col !items-center !justify-center !gap-4 !mb-8 z-10">
        <div class="!w-12 !h-12 !rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 !flex !items-center !justify-center !shadow-lg shadow-blue-500/30">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="!text-white">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </div>
        <span class="!text-3xl !font-bold !text-white !tracking-tight">Hess Support</span>
      </div>

      <div class="!w-full !max-w-[448px] relative z-10">
        <!-- Card Container -->
        <div class="!h-auto !bg-slate-900/90 sm:!bg-slate-800/80 backdrop-blur-xl sm:!rounded-2xl sm:!border sm:!border-slate-700 !p-8 sm:!p-10 !shadow-2xl animate-fade-in-up">
          
          <div class="!text-center !mb-10">
            <h1 class="!text-3xl !font-bold !text-white !mb-3">Sign in to your account</h1>
            <p class="!text-base !text-slate-400">Enter your credentials to access the portal</p>
          </div>

          <form v-if="!authStore.mfaRequired" @submit.prevent="handleLogin" class="!space-y-6">
            <!-- Email Input -->
            <div class="!flex !flex-col">
              <label class="!block !text-[15px] !font-medium !text-slate-300 !mb-2 !text-left" for="email">Email address</label>
              <input v-model="email" type="email" id="email" class="!w-full !h-12 !bg-slate-900 !border !border-slate-700 !rounded-lg !px-4 !text-[15px] !text-white placeholder-slate-500 focus:outline-none focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-500 transition-colors" placeholder="name@hess.com" required>
            </div>
            
            <!-- Password Input -->
            <div class="!flex !flex-col">
              <div class="!flex !items-center !justify-between !mb-2">
                <label class="!block !text-[15px] !font-medium !text-slate-300" for="password">Password</label>
                <a href="#" class="!text-sm !font-medium !text-blue-400 hover:!text-blue-300 transition-colors">Forgot password?</a>
              </div>
              <input v-model="password" type="password" id="password" class="!w-full !h-12 !bg-slate-900 !border !border-slate-700 !rounded-lg !px-4 !text-[15px] !text-white placeholder-slate-500 focus:outline-none focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-500 transition-colors" required>
            </div>

            <!-- Checkbox Area -->
            <div class="!flex !items-center !mt-4 !mb-2">
              <input type="checkbox" id="remember" class="!w-5 !h-5 !rounded !border-slate-700 !bg-slate-900 !text-blue-500 focus:!ring-blue-500 focus:!ring-offset-slate-800 cursor-pointer">
              <label for="remember" class="!ml-3 !block !text-[15px] !text-slate-300 cursor-pointer select-none">Remember me for 30 days</label>
            </div>

            <!-- Buttons -->
            <button type="submit" class="!w-full !h-12 !bg-blue-600 hover:!bg-blue-500 !text-white !text-base !font-semibold !rounded-lg !px-4 !shadow-lg shadow-blue-600/20 transition-all hover:!-translate-y-0.5 !flex !justify-center !items-center" :disabled="loading">
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>

          <form v-else @submit.prevent="handleMfaVerify" class="!space-y-6">
            <div class="!flex !flex-col">
              <label class="!block !text-[15px] !font-medium !text-slate-300 !mb-2 !text-left" for="otp">MFA Code</label>
              <input v-model="otpCode" type="text" id="otp" class="!w-full !h-12 !bg-slate-900 !border !border-slate-700 !rounded-lg !px-4 !text-[15px] !text-white placeholder-slate-500 focus:outline-none focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-500 transition-colors" placeholder="Enter 6-digit code" required>
              <p class="!text-sm !text-slate-500 !mt-2">Privileged accounts require TOTP/WebAuthn verification.</p>
            </div>
            <button type="submit" class="!w-full !h-12 !bg-blue-600 hover:!bg-blue-500 !text-white !text-base !font-semibold !rounded-lg !px-4 !shadow-lg shadow-blue-600/20 transition-all hover:!-translate-y-0.5 !flex !justify-center !items-center" :disabled="loading">
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ loading ? 'Verifying...' : 'Verify MFA' }}
            </button>
          </form>

          <div v-if="authError" class="!mt-4 !p-3 !rounded-lg !bg-red-500/10 !border !border-red-500/20 !text-[15px] !text-red-400">
            {{ authError }}
          </div>

          <!-- Divider -->
          <div class="!mt-8 !mb-6">
            <div class="relative">
              <div class="absolute inset-0 !flex !items-center"><div class="!w-full !border-t !border-slate-600"></div></div>
              <div class="relative !flex !justify-center !text-sm">
                <span class="!px-3 !bg-slate-900 sm:!bg-slate-800 !text-slate-400 !text-[15px]">Or continue with</span>
              </div>
            </div>
            
            <div class="!mt-6">
              <button class="!w-full !h-12 !flex !items-center !justify-center !gap-3 !bg-slate-900/50 hover:!bg-slate-900 !border !border-slate-600 !text-white !text-[15px] !font-medium !rounded-lg transition-colors">
                <svg class="!w-5 !h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Single Sign-On (SSO)
              </button>
            </div>
          </div>
          
          <!-- Demo Accounts -->
          <div class="!mt-8 !pt-6 !border-t !border-slate-700">
            <div class="!text-[13px] !font-bold !text-slate-400 !mb-4 !text-center !tracking-widest uppercase">Demo Accounts</div>
            <div class="!flex !flex-wrap !gap-3 !justify-center">
              <button @click.prevent="email='admin@test.com'; password='password'; handleLogin()" type="button" class="!px-4 !py-2 !text-[13px] !font-semibold !bg-indigo-500/10 !border !border-indigo-500/20 !text-indigo-400 !rounded-md hover:!bg-indigo-500/20 transition-colors">Admin</button>
              <button @click.prevent="email='agent@test.com'; password='password'; handleLogin()" type="button" class="!px-4 !py-2 !text-[13px] !font-semibold !bg-emerald-500/10 !border !border-emerald-500/20 !text-emerald-400 !rounded-md hover:!bg-emerald-500/20 transition-colors">Agent</button>
              <button @click.prevent="email='employee@test.com'; password='password'; handleLogin()" type="button" class="!px-4 !py-2 !text-[13px] !font-semibold !bg-slate-500/10 !border !border-slate-500/20 !text-slate-300 !rounded-md hover:!bg-slate-500/20 transition-colors">Employee</button>
              <button @click.prevent="email='isb@company.de'; password='password'; handleLogin()" type="button" class="!px-4 !py-2 !text-[13px] !font-semibold !bg-amber-500/10 !border !border-amber-500/20 !text-amber-400 !rounded-md hover:!bg-amber-500/20 transition-colors">CISO</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}
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
</style>
