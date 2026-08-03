import { defineStore } from 'pinia'
import { ref } from 'vue'
import { UserService } from '../services/UserService'
import type { User } from '../types/User'

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const isLoading = ref(false)

  async function fetchUsers() {
    isLoading.value = true
    try {
      users.value = await UserService.getAll()
    } finally {
      isLoading.value = false
    }
  }

  async function createUser(data: Partial<User>) {
    const newUser = await UserService.create(data)
    users.value.push(newUser)
    return newUser
  }

  async function updateUser(id: string, updates: Partial<User>) {
    const updated = await UserService.update(id, updates)
    const index = users.value.findIndex(u => u.id === id)
    if (index !== -1) {
      users.value[index] = updated
    }
    return updated
  }

  async function deleteUser(id: string) {
    await UserService.delete(id)
    users.value = users.value.filter(u => u.id !== id)
  }

  return { users, isLoading, fetchUsers, createUser, updateUser, deleteUser }
})
