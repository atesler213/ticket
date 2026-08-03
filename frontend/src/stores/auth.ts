import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AuthService } from '../services/AuthService'
import type { User } from '../types/User'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token') || null)
  const isAuthenticated = ref(!!token.value)
  const isLoading = ref(false)
  const mfaRequired = ref(false)
  const mfaChallengeId = ref<string | null>(null)

  async function login(email: string, pass: string) {
    isLoading.value = true
    try {
      const response = await AuthService.login(email, pass)
      user.value = response.user
      mfaRequired.value = response.mfaRequired
      mfaChallengeId.value = response.mfaChallengeId || null

      if (!response.mfaRequired) {
        token.value = response.token
        isAuthenticated.value = true
        localStorage.setItem('token', response.token)
        localStorage.setItem('user_email', email)
      }
    } finally {
      isLoading.value = false
    }
  }

  async function verifyMfa(otpCode: string) {
    if (!mfaChallengeId.value) {
      throw new Error('MFA challenge not initialized')
    }

    isLoading.value = true
    try {
      const result = await AuthService.verifyMfa(mfaChallengeId.value, otpCode)
      if (!result.verified) {
        throw new Error('Invalid MFA code')
      }

      token.value = token.value || 'mock.jwt.token.12345'
      isAuthenticated.value = true
      localStorage.setItem('token', token.value)
      mfaRequired.value = false
      mfaChallengeId.value = null
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    isAuthenticated.value = false
    mfaRequired.value = false
    mfaChallengeId.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user_email')
  }

  async function checkSession() {
    if (token.value) {
      try {
        const validatedUser = await AuthService.validateSession(token.value)
        user.value = validatedUser
        isAuthenticated.value = true
      } catch {
        logout()
      }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    mfaRequired,
    mfaChallengeId,
    login,
    verifyMfa,
    logout,
    checkSession
  }
})
