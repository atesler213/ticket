import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Announcement {
  id: string
  title: string
  message: string
  audience: string
  isActive: boolean
  createdAt: string
}

export const useAnnouncementStore = defineStore('announcement', () => {
  const announcements = ref<Announcement[]>([
    {
      id: 'n-1',
      title: 'ISO27001 Internal Audit Window',
      message: 'Evidence collection for Q3 internal audit starts on 2026-08-10.',
      audience: 'All Staff',
      isActive: true,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'n-2',
      title: 'Mandatory MFA Reminder',
      message: 'All privileged accounts must complete MFA enrollment by end of week.',
      audience: 'Admins, Agents, CISO',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ])
  const isLoading = ref(false)

  async function fetchAnnouncements() {
    isLoading.value = true
    // simulate network
    await new Promise(r => setTimeout(r, 400))
    isLoading.value = false
  }

  async function createAnnouncement(data: Partial<Announcement>) {
    const newNotice: Announcement = {
      id: `ann-${Date.now()}`,
      title: data.title || '',
      message: data.message || '',
      audience: data.audience || 'All Staff',
      isActive: data.isActive !== false,
      createdAt: new Date().toISOString()
    }
    announcements.value.unshift(newNotice)
  }

  async function updateAnnouncement(id: string, data: Partial<Announcement>) {
    const idx = announcements.value.findIndex(a => a.id === id)
    if (idx !== -1) {
      announcements.value[idx] = { ...announcements.value[idx], ...data }
    }
  }

  async function deleteAnnouncement(id: string) {
    const idx = announcements.value.findIndex(a => a.id === id)
    if (idx !== -1) {
      announcements.value.splice(idx, 1)
    }
  }

  return { announcements, isLoading, fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement }
})
