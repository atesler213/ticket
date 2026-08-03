<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSLAStore } from '../../stores/sla'
import SlideOver from '../../components/admin/SlideOver.vue'
import type { SLAPolicy } from '../../types/SLAPolicy'

const slaStore = useSLAStore()

onMounted(async () => {
  await slaStore.fetchAll()
})

const policies = computed(() => slaStore.policies)

// ── SlideOver State ──────────────────────────────────────────────
const isSlideOverOpen = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)

const currentPolicy = ref<Partial<SLAPolicy>>({
  name: '',
  description: '',
  isActive: true,
  conditions: '',
  targets: []
})

// Options for priority in the form
const priorities = ['All Priorities', 'Low', 'Medium', 'High', 'Urgent']

function openCreate() {
  isEditing.value = false
  currentPolicy.value = {
    name: '',
    description: '',
    isActive: true,
    conditions: 'All tickets',
    targets: [
      { priority: 'Low', firstResponseMinutes: 480, resolutionMinutes: 4320 },
      { priority: 'Medium', firstResponseMinutes: 240, resolutionMinutes: 1440 },
      { priority: 'High', firstResponseMinutes: 60, resolutionMinutes: 480 },
      { priority: 'Urgent', firstResponseMinutes: 15, resolutionMinutes: 120 }
    ]
  }
  isSlideOverOpen.value = true
}

function openEdit(policy: SLAPolicy) {
  isEditing.value = true
  // deep copy
  currentPolicy.value = JSON.parse(JSON.stringify(policy))
  isSlideOverOpen.value = true
}

function addTarget() {
  if (!currentPolicy.value.targets) currentPolicy.value.targets = []
  currentPolicy.value.targets.push({ priority: 'Low', firstResponseMinutes: 60, resolutionMinutes: 240 })
}

function removeTarget(index: number) {
  if (currentPolicy.value.targets) {
    currentPolicy.value.targets.splice(index, 1)
  }
}

async function savePolicy() {
  if (!currentPolicy.value.name) return

  isSubmitting.value = true
  try {
    if (isEditing.value && currentPolicy.value.id) {
      await slaStore.updatePolicy(currentPolicy.value.id, currentPolicy.value)
    } else {
      await slaStore.createPolicy(currentPolicy.value)
    }
    isSlideOverOpen.value = false
  } catch (error) {
    console.error('Error saving SLA policy:', error)
  } finally {
    isSubmitting.value = false
  }
}

// ── Helpers ──────────────────────────────────────────────────────
function formatMinutes(mins: number) {
  if (mins < 60) return `${mins} mins`
  if (mins < 1440) {
    const hrs = mins / 60
    return `${hrs} hour${hrs !== 1 ? 's' : ''}`
  }
  const days = mins / 1440
  return `${days} day${days !== 1 ? 's' : ''}`
}

function getPriorityColor(priority: string) {
  const map: Record<string, string> = {
    'Low': '#22C55E',
    'Medium': '#3B82F6',
    'High': '#F59E0B',
    'Urgent': '#EF4444',
    'All Priorities': '#8B5CF6'
  }
  return map[priority] || '#94A3B8'
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6 animate-slide-up">
      <p class="text-sm text-gray-500">Define Service Level Agreements for ticket response and resolution times.</p>
      <button class="btn btn-primary btn-sm" @click="openCreate">Create New Policy</button>
    </div>

    <!-- Loading State -->
    <div v-if="slaStore.isLoading && policies.length === 0" style="text-align:center;padding:60px 0;color:#94A3B8;">
      <svg style="animation:spin 1s linear infinite;margin:0 auto 12px;display:block;" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      <p style="font-size:14px;margin:0;">Loading policies...</p>
    </div>

    <!-- Policy List -->
    <div v-else class="grid grid-cols-1 gap-6 stagger">
      <div v-for="policy in policies" :key="policy.id" class="card card-no-hover animate-slide-up" style="border: 1px solid #E2E8F0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-radius: 12px; background: #fff; overflow: hidden;">
        
        <!-- Policy Header -->
        <div style="padding:16px 24px; border-bottom: 1px solid #F1F5F9; display:flex; justify-content:space-between; align-items:center;">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {{ policy.name }}
            <span v-if="policy.isActive" class="badge badge-active text-xs" style="background:#ECFDF5; color:#10B981;">Active</span>
            <span v-else class="badge text-xs" style="background:#F1F5F9; color:#64748B;">Inactive</span>
          </h3>
          <button class="btn btn-ghost btn-sm" @click="openEdit(policy)" style="color:#6366F1; font-weight:600; padding:4px 10px; border-radius:6px; transition: background 0.2s;" onmouseover="this.style.background='#EEF2FF'" onmouseleave="this.style.background='transparent'">Edit</button>
        </div>
        
        <!-- Policy Body -->
        <div style="padding:24px;">
          <p class="text-sm text-gray-500 mb-6">{{ policy.description }}</p>
          <div v-if="policy.conditions" style="margin-bottom:20px; font-size:13px; color:#475569; background:#F8FAFC; padding:10px 14px; border-radius:6px; border:1px solid #E2E8F0;">
            <strong>Conditions:</strong> {{ policy.conditions }}
          </div>
          
          <table style="width:100%; text-align:left; font-size:13px; border-collapse: separate; border-spacing: 0;">
            <thead style="background:#F8FAFC;">
              <tr>
                <th style="padding:10px 16px; font-weight:600; color:#475569; border-bottom:1px solid #E2E8F0; border-top-left-radius:8px;">Priority</th>
                <th style="padding:10px 16px; font-weight:600; color:#475569; border-bottom:1px solid #E2E8F0;">First Response Target</th>
                <th style="padding:10px 16px; font-weight:600; color:#475569; border-bottom:1px solid #E2E8F0; border-top-right-radius:8px;">Resolution Target</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(target, idx) in policy.targets" :key="idx">
                <td style="padding:12px 16px; border-bottom:1px solid #F1F5F9; font-weight:500; color:#1E293B; display:flex; items-center; gap:6px;">
                  <span :style="`width:6px;height:6px;border-radius:50%;background:${getPriorityColor(target.priority)};display:inline-block;margin-top:7px;`"></span>
                  {{ target.priority }}
                </td>
                <td style="padding:12px 16px; border-bottom:1px solid #F1F5F9; color:#475569;">{{ formatMinutes(target.firstResponseMinutes) }}</td>
                <td style="padding:12px 16px; border-bottom:1px solid #F1F5F9; color:#475569;">{{ formatMinutes(target.resolutionMinutes) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SlideOver for Create/Edit -->
    <SlideOver :show="isSlideOverOpen" :title="isEditing ? 'Edit SLA Policy' : 'Create SLA Policy'" @close="isSlideOverOpen = false">
      <template #content>
        <div class="space-y-6">
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Policy Name</label>
            <input v-model="currentPolicy.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="e.g. VIP Support SLA">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea v-model="currentPolicy.description" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Conditions</label>
            <input v-model="currentPolicy.conditions" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="e.g. Requester Department = Executive">
          </div>

          <div class="flex items-center gap-2 mt-2">
            <input type="checkbox" v-model="currentPolicy.isActive" id="isActiveCheck" class="rounded text-primary-600 focus:ring-primary-500">
            <label for="isActiveCheck" class="text-sm font-medium text-gray-700">Policy is Active</label>
          </div>

          <hr class="border-gray-200" />

          <div>
            <div class="flex justify-between items-center mb-3">
              <label class="block text-sm font-medium text-gray-700">SLA Targets</label>
              <button @click="addTarget" class="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Target
              </button>
            </div>
            
            <div v-for="(target, index) in currentPolicy.targets" :key="index" class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-3 relative">
              <button @click="removeTarget(index)" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              
              <div class="grid grid-cols-1 gap-4">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Priority</label>
                  <select v-model="target.priority" class="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white">
                    <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
                  </select>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">First Response (mins)</label>
                    <input v-model="target.firstResponseMinutes" type="number" class="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white">
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Resolution (mins)</label>
                    <input v-model="target.resolutionMinutes" type="number" class="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white">
                  </div>
                </div>
              </div>
            </div>
            <p v-if="!currentPolicy.targets || currentPolicy.targets.length === 0" class="text-sm text-gray-500 italic text-center py-4">No targets defined. Tickets matching this policy will have no SLA.</p>
          </div>

        </div>
      </template>

      <template #footer>
        <button class="btn btn-secondary" @click="isSlideOverOpen = false">Cancel</button>
        <button class="btn btn-primary ml-3" @click="savePolicy" :disabled="isSubmitting || !currentPolicy.name">
          <span v-if="isSubmitting">Saving...</span>
          <span v-else>Save Policy</span>
        </button>
      </template>
    </SlideOver>

  </div>
</template>

<style scoped>
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
