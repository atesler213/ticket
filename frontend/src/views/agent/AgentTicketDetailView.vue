<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTicketStore } from '../../stores/ticket'
import { useAuthStore } from '../../stores/auth'
import { ArrowLeft, Send } from 'lucide-vue-next'
import { format } from 'date-fns'

const route = useRoute()
const ticketStore = useTicketStore()
const authStore = useAuthStore()

const ticketId = route.params.id as string
const ticket = computed(() => ticketStore.tickets.find(t => t.id === ticketId))
const isLoading = ref(true)

const replyContent = ref('')
const isSubmitting = ref(false)
const isInternalNote = ref(false)

onMounted(async () => {
  if (ticketStore.tickets.length === 0) {
    await ticketStore.fetchAllTickets()
  }
  isLoading.value = false
})

async function handleReplySubmit() {
  if (!ticket.value || !authStore.user || !replyContent.value.trim()) return
  isSubmitting.value = true
  try {
    await ticketStore.addReply(ticket.value.id, replyContent.value, authStore.user.id, isInternalNote.value)
    replyContent.value = ''
    isInternalNote.value = false
  } finally {
    isSubmitting.value = false
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Logged': return 'badge-open'
    case 'Triage': return 'badge-inprogress'
    case 'Assessment': return 'badge-pending'
    case 'Mitigation & Containment': return 'badge-inprogress'
    case 'Evidence Collection': return 'badge-pending'
    case 'Pending Verification': return 'badge-pending'
    case 'Audit Ready': return 'badge-resolved'
    case 'False Positive': return 'badge-closed'
    case 'Open': return 'badge-open'
    case 'In Progress': return 'badge-inprogress'
    case 'Pending': return 'badge-pending'
    case 'Resolved': return 'badge-resolved'
    case 'Closed': return 'badge-closed'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateStr: string) => {
  return format(new Date(dateStr), 'MMM dd, yyyy hh:mm a')
}
</script>

<template>
  <div v-if="isLoading" class="p-8 text-center text-gray-500">Loading ticket details...</div>
  
  <div v-else-if="!ticket" class="p-8 text-center text-red-500">
    Ticket not found.
  </div>

  <div v-else>
    <!-- Breadcrumb -->
    <div class="mb-6 animate-slide-up">
      <router-link :to="{ name: 'agent.tickets' }" class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft :size="16" class="mr-1.5" /> Back to Tickets
      </router-link>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left: Ticket Conversation -->
      <div class="flex-1 min-w-0">
        <!-- Ticket Header -->
        <div class="card card-no-hover mb-6 animate-slide-up">
          <div class="card-body" style="padding: 24px;">
            <div class="flex items-start justify-between mb-3">
              <div>
                <div class="flex items-center gap-3 mb-2">
                  <h1 class="text-xl font-bold text-gray-900">{{ ticket.title }}</h1>
                  <span class="badge" :class="getStatusClass(ticket.status)">{{ ticket.status }}</span>
                </div>
                <div class="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                  <span class="flex items-center gap-1.5 font-medium">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    #{{ ticket.id }}
                  </span>
                  <span>•</span>
                  <span>Created: {{ formatDate(ticket.createdAt) }}</span>
                  <span>•</span>
                  <span>Updated: {{ formatDate(ticket.updatedAt) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="priority">
                  <span class="priority-dot" :class="`priority-dot-${ticket.priority.toLowerCase()}`"></span> {{ ticket.priority }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="card card-no-hover animate-slide-up" style="animation-delay: 50ms;">
          <div class="tabs" style="padding: 0 24px;">
            <button class="tab active">Conversation</button>
            <button class="tab">Details</button>
            <button class="tab">Attachments <span class="tab-count">0</span></button>
            <button class="tab">History</button>
          </div>

          <!-- Conversation Timeline -->
          <div class="conversation">
            
            <!-- Original Description -->
            <div class="conversation-message">
              <div class="conversation-message-header">
                <div class="avatar avatar-blue">{{ ticket.requesterId.substring(0, 2).toUpperCase() }}</div>
                <div class="conversation-message-name">Employee</div>
                <span class="badge-requester">Requester</span>
                <span class="conversation-message-time">{{ formatDate(ticket.createdAt) }}</span>
              </div>
              <div class="conversation-message-body">
                <div class="whitespace-pre-wrap">{{ ticket.description }}</div>
              </div>
            </div>

            <!-- Ticket Events -->
            <div class="conversation-message" v-for="event in ticket.events" :key="event.id">
              <div class="conversation-message-header">
                <template v-if="event.isInternal">
                   <div class="avatar bg-yellow-100 text-yellow-700">SYS</div>
                   <div class="conversation-message-name text-yellow-800">System / Internal Note</div>
                </template>
                <template v-else-if="event.actorId === ticket.requesterId">
                  <div class="avatar avatar-blue">{{ ticket.requesterId.substring(0, 2).toUpperCase() }}</div>
                  <div class="conversation-message-name">Employee</div>
                  <span class="badge-requester">Requester</span>
                </template>
                <template v-else>
                  <div class="avatar avatar-green">AG</div>
                  <div class="conversation-message-name">Support Agent</div>
                  <span class="badge-agent">Agent</span>
                </template>
                <span class="conversation-message-time">{{ formatDate(event.createdAt) }}</span>
              </div>
              <div class="conversation-message-body" :class="{'bg-yellow-50 p-3 rounded border border-yellow-200': event.isInternal}">
                <div class="whitespace-pre-wrap">{{ event.content }}</div>
              </div>
            </div>

          </div>

          <!-- Reply Editor -->
          <div v-if="ticket.status !== 'Closed' && ticket.status !== 'Audit Ready'" class="reply-editor bg-gray-50 p-4 border-t border-gray-100 relative">
             <div class="flex gap-4 mb-2">
               <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                 <input type="radio" :value="false" v-model="isInternalNote" class="form-radio text-blue-600 focus:ring-blue-500">
                 Reply to Customer
               </label>
               <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                 <input type="radio" :value="true" v-model="isInternalNote" class="form-radio text-yellow-500 focus:ring-yellow-500">
                 Internal Note
               </label>
             </div>
            <textarea v-model="replyContent" class="reply-editor-input" :class="{'bg-yellow-50 border-yellow-200 focus:border-yellow-400 focus:ring-yellow-100': isInternalNote}" placeholder="Type your reply..." rows="4"></textarea>
            <div class="reply-editor-toolbar" :class="{'bg-yellow-50/50': isInternalNote}">
              <div class="reply-editor-tools">
                <button class="reply-editor-tool" title="Attach file"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg></button>
                <button class="reply-editor-tool" title="Image"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></button>
                <button class="reply-editor-tool" title="Emoji"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></button>
                <button class="reply-editor-tool" title="Link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>
                <button class="reply-editor-tool" title="Template"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg></button>
                <button class="reply-editor-tool" title="KB"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></button>
              </div>
              <button class="btn btn-primary h-9 px-4" :class="{'bg-yellow-600 hover:bg-yellow-700': isInternalNote}" @click="handleReplySubmit" :disabled="isSubmitting || !replyContent.trim()">
                <Send :size="16" class="mr-2" v-if="!isSubmitting" />
                {{ isSubmitting ? 'Sending...' : (isInternalNote ? 'Add Note' : 'Send Reply') }}
              </button>
            </div>
          </div>
          <div v-else class="p-6 text-center text-gray-500 bg-gray-50 border-t border-gray-100 text-sm">
            This ticket is closed and immutable. New notes are blocked for audit integrity.
          </div>
        </div>
      </div>

      <!-- Right: Ticket Info Panel -->
      <div class="w-full lg:w-72 flex-shrink-0 animate-slide-up" style="animation-delay: 100ms;">
        <div class="detail-panel">
          <!-- Ticket Info -->
          <div class="detail-panel-section">
            <div class="detail-panel-title">Ticket Info</div>
            <div class="detail-panel-row">
              <span class="detail-panel-label">Status</span>
              <span class="flex items-center gap-1.5">
                <select class="form-select" style="width:auto;height:30px;font-size:12px;padding:0 28px 0 8px;border-radius:6px;" :value="ticket.status">
                  <option value="Open">Open</option>
                  <option value="In Progress">● In Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </span>
            </div>
            <div class="detail-panel-row">
              <span class="detail-panel-label">Priority</span>
              <span class="flex items-center gap-1.5">
                <select class="form-select" style="width:auto;height:30px;font-size:12px;padding:0 28px 0 8px;border-radius:6px;" :value="ticket.priority">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">● High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </span>
            </div>
            <div class="detail-panel-row">
              <span class="detail-panel-label">Category</span>
              <span class="detail-panel-value">
                <select class="form-select" style="width:auto;height:30px;font-size:12px;padding:0 28px 0 8px;border-radius:6px;">
                  <option selected>Software</option>
                  <option>IT Hardware</option>
                  <option>Network / VPN</option>
                </select>
              </span>
            </div>
            <div class="detail-panel-row">
              <span class="detail-panel-label">Source</span>
              <span class="detail-panel-value">Portal</span>
            </div>
            <div class="detail-panel-row">
              <span class="detail-panel-label">SLA Plan</span>
              <div>
                <div class="detail-panel-value text-sm">Standard SLA</div>
                <span class="badge-sla-ok" style="font-size:11px;margin-top:2px;display:inline-block;">Within SLA</span>
              </div>
            </div>
            <div class="detail-panel-row">
              <span class="detail-panel-label">Ticket Type</span>
              <span class="detail-panel-value">Incident</span>
            </div>
          </div>

          <!-- Requester Information -->
          <div class="detail-panel-section">
            <div class="detail-panel-title">Requester Information</div>
            <div class="flex items-center gap-3 mb-4">
              <div class="avatar avatar-blue">{{ ticket.requesterId.substring(0, 2).toUpperCase() }}</div>
              <div>
                <div class="font-semibold text-gray-900 text-sm">Employee</div>
                <div class="text-xs text-gray-500">Department</div>
              </div>
            </div>
            <div class="space-y-2.5">
              <div class="flex items-center gap-2 text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><span class="text-gray-700">user@company.com</span></div>
              <div class="flex items-center gap-2 text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></svg><span class="text-gray-700">+1 123 456 7890</span></div>
            </div>
          </div>

          <!-- Assigned Agent -->
          <div class="detail-panel-section">
            <div class="detail-panel-title">Assigned To</div>
            <div class="flex items-center gap-3 mb-3" v-if="ticket.agentId">
              <img src="https://ui-avatars.com/api/?name=Agent&background=10B981&color=fff&size=40&rounded=true&bold=true" alt="AG" class="avatar-img">
              <div>
                <div class="font-semibold text-gray-900 text-sm">Support Agent</div>
                <div class="text-xs text-gray-500">IT Support Agent</div>
              </div>
            </div>
            <div class="text-sm text-gray-500 italic mb-3" v-else>
              Unassigned
            </div>
            <button class="btn btn-secondary btn-sm w-full justify-center">Change Assignee</button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
