<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketStore } from '../../stores/ticket'
import { useAuthStore } from '../../stores/auth'
import { useCategoryStore } from '../../stores/category'
import { useAssetStore } from '../../stores/asset'
import type { TicketPriority, TicketType } from '../../types/Ticket'

const router = useRouter()
const ticketStore = useTicketStore()
const authStore = useAuthStore()
const categoryStore = useCategoryStore()
const assetStore = useAssetStore()

const user = computed(() => authStore.user)

const title = ref('')
const ticketType = ref<TicketType>('ServiceHR')
const categoryId = ref('')
const selectedAssetId = ref('')
const priority = ref<TicketPriority>('High')
const description = ref('')
const isSubmitting = ref(false)

const selectedAsset = computed(() => assetStore.assets.find(a => a.id === selectedAssetId.value))

onMounted(async () => {
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories()
  }
  if (assetStore.assets.length === 0) {
    await assetStore.fetchAssets()
  }
  if (categoryStore.categories.length > 0 && !categoryId.value) {
    categoryId.value = categoryStore.categories[0].id
  }
})

function setPriority(p: TicketPriority) {
  priority.value = p
}

async function handleSubmit() {
  if (!title.value || !description.value || !user.value) return
  
  isSubmitting.value = true
  try {
    const newTicket = await ticketStore.createTicket({
      ticketType: ticketType.value,
      requesterId: user.value.id,
      companyId: user.value.companyId,
      title: title.value,
      description: description.value,
      categoryId: categoryId.value,
      priority: priority.value,
      assetId: selectedAssetId.value || null,
      dataClassification: ticketType.value === 'Incident'
        ? (selectedAsset.value?.classification || 'Internal')
        : undefined,
      isSensitiveQueue: ticketType.value === 'Incident' && (
        selectedAsset.value?.classification === 'Confidential' ||
        selectedAsset.value?.classification === 'Restricted'
      ),
      incidentDetails: ticketType.value === 'Incident' ? {
        detectionSource: 'UserReport',
        affectedAssetIds: selectedAssetId.value ? [selectedAssetId.value] : [],
        classification: selectedAsset.value?.classification || 'Internal',
        severity: selectedAsset.value?.ciaRating?.confidentiality === 'High' ||
          selectedAsset.value?.ciaRating?.integrity === 'High' ||
          selectedAsset.value?.ciaRating?.availability === 'High'
          ? 'High'
          : 'Medium'
      } : undefined
    })
    
    router.push({ name: 'employee.ticket.detail', params: { id: newTicket.id } })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8 animate-slide-up">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">Create New Ticket</h1>
      <p class="text-gray-500 text-[15px]">Fill out the form below to submit your request to the IT Support team.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
      <!-- Main Form -->
      <div class="col-span-1 md:col-span-8">
        <div class="card card-no-hover animate-slide-up">
          <form @submit.prevent="handleSubmit" class="card-body" style="padding: 28px;">

            <!-- Your Information -->
            <h3 class="text-[15px] font-semibold text-gray-900 mb-4">Your Information</h3>
            <div class="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-[10px] p-4 mb-8">
              <div class="flex items-center gap-3">
                <div class="avatar avatar-blue">{{ user?.name.substring(0, 2).toUpperCase() }}</div>
                <div>
                  <div class="font-semibold text-gray-900">{{ user?.name }}</div>
                  <div class="text-sm text-gray-500">IT Department &bull; {{ user?.email }}</div>
                </div>
              </div>
              <span class="badge-autofill">Auto-filled</span>
            </div>

            <!-- Category + Asset Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div class="form-group" style="margin-bottom:0">
                <label class="form-label">Ticket Type <span class="required">*</span></label>
                <div class="relative">
                  <select v-model="ticketType" class="form-select" style="padding-left: 40px;" required>
                    <option value="Incident">Security Incident</option>
                    <option value="Risk">Risk Management</option>
                    <option value="Change">Change Management</option>
                    <option value="ServiceHR">Service / HR Process</option>
                  </select>
                  <svg style="position:absolute; left:12px; top:50%; transform:translateY(-50%); width:18px; height:18px; color:var(--gray-400);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label class="form-label">Issue Category <span class="required">*</span></label>
                <div class="relative">
                  <select v-model="categoryId" class="form-select" style="padding-left: 40px;" required>
                    <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                  </select>
                  <svg style="position:absolute; left:12px; top:50%; transform:translateY(-50%); width:18px; height:18px; color:var(--gray-400);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09"/></svg>
                </div>
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label class="form-label">Related Asset <span class="optional">(Optional)</span></label>
                <div class="relative">
                  <select v-model="selectedAssetId" class="form-select" style="padding-left: 40px;">
                    <option value="">None</option>
                    <option v-for="asset in assetStore.assets" :key="asset.id" :value="asset.id">{{ asset.name }} - {{ asset.assetTag }}</option>
                  </select>
                  <svg style="position:absolute; left:12px; top:50%; transform:translateY(-50%); width:18px; height:18px; color:var(--gray-400);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <p v-if="ticketType === 'Incident' && selectedAsset?.ciaRating" class="text-xs text-gray-500 mt-2">
                  CIA: C={{ selectedAsset.ciaRating.confidentiality }}, I={{ selectedAsset.ciaRating.integrity }}, A={{ selectedAsset.ciaRating.availability }} | Classification: {{ selectedAsset.classification || 'Internal' }}
                </p>
              </div>
            </div>

            <!-- Priority Level -->
            <div class="form-group mb-6">
              <label class="form-label">Priority Level <span class="required">*</span></label>
              <div class="priority-selector">
                <div class="priority-option cursor-pointer" :class="{ selected: priority === 'Low' }" @click="setPriority('Low')">
                  <span class="priority-dot priority-dot-low"></span>
                  Low
                  <span class="radio-circle"></span>
                </div>
                <div class="priority-option cursor-pointer" :class="{ selected: priority === 'Medium' }" @click="setPriority('Medium')">
                  <span class="priority-dot priority-dot-medium"></span>
                  Medium
                  <span class="radio-circle"></span>
                </div>
                <div class="priority-option cursor-pointer" :class="{ selected: priority === 'High' }" @click="setPriority('High')">
                  <span class="priority-dot priority-dot-high"></span>
                  High
                  <span class="radio-circle"></span>
                </div>
                <div class="priority-option cursor-pointer" :class="{ selected: priority === 'Urgent' }" @click="setPriority('Urgent')">
                  <span class="priority-dot priority-dot-urgent"></span>
                  Urgent
                  <span class="radio-circle"></span>
                </div>
              </div>
            </div>

            <!-- Subject -->
            <div class="form-group mb-6">
              <label class="form-label">Subject / Title <span class="required">*</span></label>
              <input v-model="title" type="text" class="form-input" placeholder="Enter a brief summary of your issue" required>
            </div>

            <!-- Rich Description -->
            <div class="form-group mb-6">
              <label class="form-label">Detailed Description <span class="required">*</span></label>
              <div class="rich-editor">
                <div class="rich-editor-toolbar">
                  <button type="button" class="rich-editor-toolbar-btn" title="Bold"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg></button>
                  <button type="button" class="rich-editor-toolbar-btn" title="Italic"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg></button>
                  <button type="button" class="rich-editor-toolbar-btn" title="Underline"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg></button>
                  <div class="rich-editor-toolbar-divider"></div>
                  <button type="button" class="rich-editor-toolbar-btn" title="Bulleted List"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></button>
                  <button type="button" class="rich-editor-toolbar-btn" title="Ordered List"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg></button>
                  <div class="rich-editor-toolbar-divider"></div>
                  <button type="button" class="rich-editor-toolbar-btn" title="Link"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>
                  <button type="button" class="rich-editor-toolbar-btn" title="Image"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></button>
                  <button type="button" class="rich-editor-toolbar-btn" title="Code"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></button>
                </div>
                <!-- Using textarea instead of contenteditable for Vue binding, styling to match HTML -->
                <textarea v-model="description" class="rich-editor-body w-full focus:outline-none resize-y" rows="8" placeholder="Please assist..."></textarea>
              </div>
            </div>

            <!-- Attachments -->
            <div class="form-group mb-8">
              <label class="form-label">Attachments <span class="optional">(Optional)</span></label>
              <div class="file-upload">
                <div class="file-upload-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <div class="file-upload-text">Drag & drop files here or <span class="file-upload-link">click to browse</span></div>
                <div class="file-upload-hint">Supported formats: PNG, JPG, PDF, DOCX, TXT &nbsp;(Max 10MB per file)</div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" class="btn btn-secondary btn-lg" @click="router.back()">Cancel</button>
              <button type="submit" class="btn btn-primary btn-lg" :disabled="isSubmitting">
                <svg v-if="!isSubmitting" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" class="mr-2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                {{ isSubmitting ? 'Submitting...' : 'Submit Ticket' }}
              </button>
            </div>

          </form>
        </div>
      </div>

      <!-- Right Help Panel -->
      <div class="col-span-1 md:col-span-4">
        <!-- Need Help Before Submitting -->
        <div class="card card-no-hover mb-6 animate-slide-up">
          <div class="card-body" style="padding: 24px;">
            <h3 class="text-[15px] font-semibold text-gray-900 mb-1">Need Help Before Submitting?</h3>
            <p class="text-sm text-gray-500 mb-5">Check our resources or tips below.</p>

            <!-- KB Link -->
            <a href="#" class="flex items-center gap-4 p-4 rounded-[10px] border border-gray-200 mb-3 hover:bg-gray-50 hover:border-gray-300 transition-all group">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background: var(--success-50);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </div>
              <div class="flex-1">
                <div class="font-semibold text-gray-900 text-sm">Knowledgebase / FAQ</div>
                <div class="text-xs text-gray-500">Find answers to common IT issues.</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 group-hover:text-blue-600 transition-colors"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>

            <!-- Common Issues -->
            <a href="#" class="flex items-center gap-4 p-4 rounded-[10px] border border-gray-200 mb-3 hover:bg-gray-50 hover:border-gray-300 transition-all group">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background: var(--warning-50);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div class="flex-1">
                <div class="font-semibold text-gray-900 text-sm">Common Issues</div>
                <div class="text-xs text-gray-500">Browse popular solutions and troubleshooting steps.</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 group-hover:text-blue-600 transition-colors"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>

            <!-- Contact Support -->
            <a href="#" class="flex items-center gap-4 p-4 rounded-[10px] border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all group">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background: var(--primary-50);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div class="flex-1">
                <div class="font-semibold text-gray-900 text-sm">Contact IT Support</div>
                <div class="text-xs text-gray-500">Still need help? Our team is here for you.</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 group-hover:text-blue-600 transition-colors"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>

          </div>
        </div>

        <!-- Tips -->
        <div class="card card-no-hover animate-slide-up">
          <div class="card-body" style="padding: 24px;">
            <h3 class="text-sm font-semibold mb-4" style="color: var(--primary-600);">Tips for a Faster Resolution</h3>
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0 mt-0.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span class="text-sm text-gray-600">Select the most accurate category.</span>
              </div>
              <div class="flex items-start gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0 mt-0.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span class="text-sm text-gray-600">Provide a clear and detailed description.</span>
              </div>
              <div class="flex items-start gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0 mt-0.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span class="text-sm text-gray-600">Attach screenshots or error messages if possible.</span>
              </div>
              <div class="flex items-start gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0 mt-0.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span class="text-sm text-gray-600">Include the asset related to the issue.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
