<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

const activeCount = computed(() => announcementStore.announcements.filter(a => a.isActive).length)
const draftCount = computed(() => announcementStore.announcements.filter(a => !a.isActive).length)

// Focus handlers for inputs
function onFocus(e: Event) {
  const el = e.target as HTMLElement
  el.style.borderColor = '#6366F1'
  el.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'
}
function onBlur(e: Event) {
  const el = e.target as HTMLElement
  el.style.borderColor = '#E2E8F0'
  el.style.boxShadow = 'none'
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;" class="animate-slide-up">
      <div>
        <h1 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px 0;">Announcements</h1>
        <p style="font-size: 13px; color: #64748B; margin: 0;">Security and compliance communication feed.</p>
      </div>
      <button
        @click="openCreate"
        style="
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 16px; font-size: 13px; font-weight: 600;
          color: #fff; background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
          border: none; border-radius: 8px; cursor: pointer; white-space: nowrap;
          box-shadow: 0 2px 8px rgba(99,102,241,0.3); transition: all 0.15s;
        "
        @mouseover="($event.currentTarget as HTMLElement).style.boxShadow='0 4px 16px rgba(99,102,241,0.45)';($event.currentTarget as HTMLElement).style.transform='translateY(-1px)'"
        @mouseleave="($event.currentTarget as HTMLElement).style.boxShadow='0 2px 8px rgba(99,102,241,0.3)';($event.currentTarget as HTMLElement).style.transform='translateY(0)'"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Create Announcement
      </button>
    </div>

    <!-- KPI Stats -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;" class="stagger">
      <div
        v-for="(stat, i) in [
          { label: 'Total Announcements', value: announcementStore.announcements.length, icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', color: '#6366F1', bg: '#EEF2FF' },
          { label: 'Published / Active', value: activeCount, icon: 'M5 13l4 4L19 7', color: '#10B981', bg: '#ECFDF5' },
          { label: 'Drafts', value: draftCount, icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', color: '#F59E0B', bg: '#FFF7ED' }
        ]"
        :key="i"
        class="animate-slide-up"
        style="
          background: #fff; border: 1px solid #E2E8F0; border-radius: 12px;
          padding: 18px 20px; display: flex; align-items: center; gap: 14px;
          box-shadow: 0 1px 4px rgba(15,23,42,0.05); transition: box-shadow 0.2s, transform 0.2s;
        "
        @mouseover="($event.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(15,23,42,0.09)'; ($event.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'"
        @mouseleave="($event.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(15,23,42,0.05)'; ($event.currentTarget as HTMLElement).style.transform = 'translateY(0)'"
      >
        <div :style="`width: 40px; height: 40px; border-radius: 10px; background: ${stat.bg}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="stat.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path :d="stat.icon"/>
          </svg>
        </div>
        <div>
          <div style="font-size: 24px; font-weight: 800; color: #0F172A; line-height: 1;">{{ stat.value }}</div>
          <div style="font-size: 12px; color: #64748B; margin-top: 2px; font-weight: 500;">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- Announcement List -->
    <div v-if="announcementStore.isLoading" style="text-align: center; padding: 60px 0; color: #94A3B8;">
      <svg style="animation: spin 1s linear infinite; margin: 0 auto 12px; display: block;" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      <p style="font-size: 14px; margin: 0;">Loading announcements...</p>
    </div>
    
    <div v-else-if="announcementStore.announcements.length === 0" style="text-align: center; padding: 60px 20px;">
      <p style="color: #94A3B8; font-size: 14px; margin: 0;">No announcements found.</p>
    </div>

    <div v-else style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 16px;" class="stagger">
      <div 
        v-for="notice in announcementStore.announcements" 
        :key="notice.id" 
        class="animate-slide-up"
        :style="`
          background: #fff; border: 1px solid ${notice.isActive ? '#E2E8F0' : '#E2E8F0'};
          border-radius: 12px; padding: 20px;
          box-shadow: 0 1px 4px rgba(15,23,42,0.05); transition: all 0.2s;
          opacity: ${notice.isActive ? '1' : '0.65'};
          display: flex; flex-direction: column; justify-content: space-between;
        `"
        @mouseover="($event.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(15,23,42,0.08)'; ($event.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; ($event.currentTarget as HTMLElement).style.opacity = '1'"
        @mouseleave="($event.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(15,23,42,0.05)'; ($event.currentTarget as HTMLElement).style.transform = 'translateY(0)'; ($event.currentTarget as HTMLElement).style.opacity = notice.isActive ? '1' : '0.65'"
      >
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span :style="`
                width: 10px; height: 10px; border-radius: 50%;
                background: ${notice.isActive ? '#10B981' : '#F59E0B'};
                box-shadow: 0 0 0 3px ${notice.isActive ? '#D1FAE5' : '#FEF3C7'};
              `"></span>
              <span style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">
                {{ notice.isActive ? 'Published' : 'Draft' }}
              </span>
            </div>
            
            <div style="display: flex; align-items: center; gap: 4px;">
              <button
                @click="openEdit(notice)"
                style="width: 28px; height: 28px; border-radius: 6px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748B; transition: all 0.15s;"
                @mouseover="($event.currentTarget as HTMLElement).style.background = '#EEF2FF'; ($event.currentTarget as HTMLElement).style.color = '#6366F1'"
                @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'; ($event.currentTarget as HTMLElement).style.color = '#64748B'"
                title="Edit"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button
                @click="handleDelete(notice.id)"
                style="width: 28px; height: 28px; border-radius: 6px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748B; transition: all 0.15s;"
                @mouseover="($event.currentTarget as HTMLElement).style.background = '#FEF2F2'; ($event.currentTarget as HTMLElement).style.color = '#EF4444'"
                @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'; ($event.currentTarget as HTMLElement).style.color = '#64748B'"
                title="Delete"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              </button>
            </div>
          </div>
          
          <h3 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 8px 0; line-height: 1.4;">{{ notice.title }}</h3>
          <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 16px 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
            {{ notice.message }}
          </p>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid #F1F5F9;">
          <div style="font-size: 11px; color: #94A3B8; display: flex; align-items: center; gap: 4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {{ new Date(notice.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) }}
          </div>
          <span style="font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 999px; background: #F8FAFC; color: #475569; border: 1px solid #E2E8F0;">
            @{{ notice.audience }}
          </span>
        </div>
      </div>
    </div>

    <!-- SlideOver Form -->
    <SlideOver :show="showForm" :title="isEditing ? 'Edit Announcement' : 'Create Announcement'" @close="showForm = false">
      <template #content>
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <div>
            <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">Title</label>
            <input 
              type="text" 
              v-model="formData.title" 
              placeholder="e.g. Scheduled System Maintenance"
              style="width: 100%; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box;"
              @focus="onFocus" @blur="onBlur"
            >
          </div>
          
          <div>
            <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">Message Body</label>
            <textarea 
              v-model="formData.message" 
              rows="5"
              placeholder="Write the details of the announcement here..."
              style="width: 100%; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box; resize: vertical; font-family: inherit;"
              @focus="onFocus" @blur="onBlur"
            ></textarea>
          </div>
          
          <div>
            <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">Target Audience</label>
            <select 
              v-model="formData.audience"
              style="width: 100%; padding: 10px 14px; font-size: 14px; color: #0F172A; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; outline: none; transition: all 0.15s; box-sizing: border-box; cursor: pointer;"
              @focus="onFocus" @blur="onBlur"
            >
              <option value="All Staff">All Staff (Company Wide)</option>
              <option value="IT Department">IT Department Only</option>
              <option value="Admins, Agents, CISO">Admins, Agents & CISO</option>
            </select>
          </div>
          
          <label 
            style="display: flex; align-items: center; gap: 12px; padding: 14px; border: 1.5px solid #E2E8F0; border-radius: 8px; cursor: pointer; transition: all 0.15s; background: #FAFAFA;"
            @mouseover="($event.currentTarget as HTMLElement).style.borderColor = '#C7D2FE'"
            @mouseleave="($event.currentTarget as HTMLElement).style.borderColor = '#E2E8F0'"
          >
            <input 
              type="checkbox" 
              v-model="formData.isActive"
              style="width: 18px; height: 18px; accent-color: #10B981; cursor: pointer;"
            >
            <div>
              <div style="font-size: 14px; font-weight: 600; color: #0F172A;">Publish Announcement</div>
              <div style="font-size: 12px; color: #64748B;">Make this visible to the target audience immediately.</div>
            </div>
          </label>
          
        </div>
      </template>
      
      <template #footer>
        <button
          type="button"
          style="padding: 9px 20px; font-size: 13px; font-weight: 600; color: #475569; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; cursor: pointer; transition: all 0.15s;"
          @mouseover="($event.currentTarget as HTMLElement).style.background = '#F8FAFC'"
          @mouseleave="($event.currentTarget as HTMLElement).style.background = '#fff'"
          @click="showForm = false"
        >
          Cancel
        </button>
        <button
          type="button"
          style="
            padding: 9px 20px; font-size: 13px; font-weight: 600; color: #fff;
            background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
            border: none; border-radius: 8px; cursor: pointer;
            box-shadow: 0 2px 8px rgba(99,102,241,0.35); transition: all 0.15s;
            display: inline-flex; align-items: center; gap: 6px;
          "
          @mouseover="($event.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(99,102,241,0.45)'; ($event.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(99,102,241,0.35)'; ($event.currentTarget as HTMLElement).style.transform = 'translateY(0)'"
          @click="handleSave"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {{ isEditing ? 'Save Changes' : 'Publish Announcement' }}
        </button>
      </template>
    </SlideOver>
  </div>
</template>

<style>
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
