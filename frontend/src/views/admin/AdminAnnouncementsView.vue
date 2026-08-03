<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAnnouncementStore, type Announcement } from '../../stores/announcement'
import SlideOver from '../../components/admin/SlideOver.vue'

const announcementStore = useAnnouncementStore()

onMounted(async () => {
  await announcementStore.fetchAnnouncements()
})

const showForm = ref(false)
const isEditing = ref(false)
const currentId = ref('')

const formData = ref<Partial<Announcement>>({
  title: '',
  message: '',
  audience: 'All Staff',
  isActive: true
})

function openCreate() {
  isEditing.value = false
  currentId.value = ''
  formData.value = { title: '', message: '', audience: 'All Staff', isActive: true }
  showForm.value = true
}

function openEdit(notice: Announcement) {
  isEditing.value = true
  currentId.value = notice.id
  formData.value = { ...notice }
  showForm.value = true
}

async function handleDelete(id: string) {
  if (confirm('Are you sure you want to delete this announcement?')) {
    await announcementStore.deleteAnnouncement(id)
  }
}

async function handleSave() {
  if (isEditing.value) {
    await announcementStore.updateAnnouncement(currentId.value, formData.value)
  } else {
    await announcementStore.createAnnouncement(formData.value)
  }
  showForm.value = false
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6 animate-slide-up">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Announcements</h1>
        <p class="text-gray-500 mt-1">Security and compliance communication feed.</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">Create Announcement</button>
    </div>

    <div class="grid gap-4">
      <div v-if="announcementStore.isLoading" class="text-center py-8 text-gray-500">Loading announcements...</div>
      <div v-else-if="announcementStore.announcements.length === 0" class="text-center py-8 text-gray-500">No announcements found.</div>
      <div v-else v-for="notice in announcementStore.announcements" :key="notice.id" class="card card-no-hover animate-slide-up p-5" :class="{'opacity-60': !notice.isActive}">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-gray-900">{{ notice.title }}</h3>
              <span v-if="!notice.isActive" class="badge badge-inactive text-xs">Draft / Inactive</span>
            </div>
            <p class="text-sm text-gray-600 mt-1">{{ notice.message }}</p>
            <div class="text-xs text-gray-400 mt-3">{{ new Date(notice.createdAt).toLocaleString() }}</div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <span class="badge badge-pending">{{ notice.audience }}</span>
            <div class="flex items-center gap-2 mt-2">
              <button @click="openEdit(notice)" class="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
              <button @click="handleDelete(notice.id)" class="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <SlideOver :show="showForm" :title="isEditing ? 'Edit Announcement' : 'Create Announcement'" @close="showForm = false">
      <template #content>
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" v-model="formData.title" class="form-input w-full" placeholder="e.g. System Maintenance">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea v-model="formData.message" class="form-input w-full" rows="4"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
            <select v-model="formData.audience" class="form-select w-full">
              <option value="All Staff">All Staff</option>
              <option value="IT Department">IT Department</option>
              <option value="Admins, Agents, CISO">Admins, Agents, CISO</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" v-model="formData.isActive" id="isActAnn">
            <label for="isActAnn" class="text-sm text-gray-700">Published (Visible to audience)</label>
          </div>
        </div>
      </template>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="showForm = false">Cancel</button>
        <button type="button" class="btn btn-primary" @click="handleSave">Save</button>
      </template>
    </SlideOver>
  </div>
</template>
