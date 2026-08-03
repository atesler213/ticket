<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketStore } from '../../stores/ticket'
import { useUserStore } from '../../stores/user'
import { formatDistanceToNow } from 'date-fns'
import type { TicketStatus, TicketPriority, Ticket } from '../../types/Ticket'
import SlideOver from '../../components/admin/SlideOver.vue'

const router = useRouter()
const ticketStore = useTicketStore()
const userStore = useUserStore()

onMounted(async () => {
  await Promise.all([
    ticketStore.fetchAllTickets(),
    userStore.fetchUsers()
  ])
})

// ── Filters ──────────────────────────────────────────────────────
const searchQuery = ref('')
const filterStatus = ref<TicketStatus | 'All'>('All')
const filterPriority = ref<TicketPriority | 'All'>('All')
const filterAssignee = ref<'All' | 'Assigned' | 'Unassigned'>('All')
const activeTab = ref<'all' | 'open' | 'pending' | 'resolved'>('all')

const statuses: (TicketStatus | 'All')[] = ['All', 'Open', 'In Progress', 'Pending', 'Resolved', 'Closed']
const priorities: (TicketPriority | 'All')[] = ['All', 'Urgent', 'High', 'Medium', 'Low']

const filteredTickets = computed(() => {
  let list = ticketStore.tickets

  // Tab filter
  if (activeTab.value === 'open') list = list.filter(t => t.status === 'Open' || t.status === 'In Progress')
  else if (activeTab.value === 'pending') list = list.filter(t => t.status === 'Pending')
  else if (activeTab.value === 'resolved') list = list.filter(t => t.status === 'Resolved' || t.status === 'Closed')

  // Search
  const q = searchQuery.value.toLowerCase()
  if (q) list = list.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.id.toLowerCase().includes(q) ||
    ((t as any).requesterName || '').toLowerCase().includes(q) ||
    ((t as any).category || '').toLowerCase().includes(q)
  )

  // Status
  if (filterStatus.value !== 'All') list = list.filter(t => t.status === filterStatus.value)

  // Priority
  if (filterPriority.value !== 'All') list = list.filter(t => t.priority === filterPriority.value)

  // Assignee
  if (filterAssignee.value === 'Assigned') list = list.filter(t => t.assigneeId)
  else if (filterAssignee.value === 'Unassigned') list = list.filter(t => !t.assigneeId)

  return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

// ── Stats ────────────────────────────────────────────────────────
const stats = computed(() => {
  const all = ticketStore.tickets
  return {
    total: all.length,
    open: all.filter(t => t.status === 'Open').length,
    inProgress: all.filter(t => t.status === 'In Progress').length,
    pending: all.filter(t => t.status === 'Pending').length,
    resolved: all.filter(t => t.status === 'Resolved' || t.status === 'Closed').length,
    breached: all.filter(t => t.sla?.isBreached).length,
  }
})

// ── Helpers ──────────────────────────────────────────────────────
interface StatusStyle { bg: string; color: string; dot: string }

function statusStyle(status: string): StatusStyle {
  const map: Record<string, StatusStyle> = {
    'Open':        { bg: '#EFF6FF', color: '#2563EB', dot: '#3B82F6' },
    'In Progress': { bg: '#FFF7ED', color: '#D97706', dot: '#F59E0B' },
    'Pending':     { bg: '#FDF4FF', color: '#9333EA', dot: '#A855F7' },
    'Resolved':    { bg: '#F0FDF4', color: '#16A34A', dot: '#22C55E' },
    'Closed':      { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8' },
  }
  return map[status] || { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8' }
}

interface PriorityStyle { color: string; bg: string }

function priorityStyle(priority: string): PriorityStyle {
  const map: Record<string, PriorityStyle> = {
    'Urgent': { color: '#DC2626', bg: '#FEF2F2' },
    'High':   { color: '#D97706', bg: '#FFF7ED' },
    'Medium': { color: '#2563EB', bg: '#EFF6FF' },
    'Low':    { color: '#16A34A', bg: '#F0FDF4' },
  }
  return map[priority] || { color: '#64748B', bg: '#F1F5F9' }
}

function formatDate(d: string) {
  return formatDistanceToNow(new Date(d), { addSuffix: true })
}

function goToTicket(id: string) {
  router.push({ name: 'agent.ticket.detail', params: { id } })
}

// Focus/blur for inputs
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

// Tab counts
function tabCount(tab: string) {
  const all = ticketStore.tickets
  if (tab === 'all') return all.length
  if (tab === 'open') return all.filter(t => t.status === 'Open' || t.status === 'In Progress').length
  if (tab === 'pending') return all.filter(t => t.status === 'Pending').length
  if (tab === 'resolved') return all.filter(t => t.status === 'Resolved' || t.status === 'Closed').length
  return 0
}
// ── Assignment SlideOver ─────────────────────────────────────────
const showAssign = ref(false)
const assigningTicket = ref<Ticket | null>(null)
const selectedAssigneeId = ref('')

function openAssign(ticket: Ticket) {
  assigningTicket.value = ticket
  selectedAssigneeId.value = ticket.assigneeId || ''
  showAssign.value = true
}

async function handleAssign() {
  if (assigningTicket.value) {
    const assignee = userStore.users.find(u => u.id === selectedAssigneeId.value)
    await ticketStore.updateTicket(assigningTicket.value.id, {
      assigneeId: assignee?.id || undefined,
      assigneeName: assignee?.name || undefined
    })
  }
  showAssign.value = false
}
</script>

<template>
  <div>
    <!-- ── KPI Cards ──────────────────────────────────────────── -->
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:14px;margin-bottom:22px;">
      <div
        v-for="card in [
          { label:'Total',      value: stats.total,      icon:'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18', color:'#6366F1', bg:'#EEF2FF' },
          { label:'Open',       value: stats.open,       icon:'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83', color:'#3B82F6', bg:'#EFF6FF' },
          { label:'In Progress',value: stats.inProgress,  icon:'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z', color:'#F59E0B', bg:'#FFF7ED' },
          { label:'Pending',    value: stats.pending,    icon:'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z', color:'#A855F7', bg:'#FDF4FF' },
          { label:'Resolved',   value: stats.resolved,   icon:'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z', color:'#10B981', bg:'#ECFDF5' },
          { label:'SLA Breached',value:stats.breached,   icon:'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', color:'#EF4444', bg:'#FEF2F2' },
        ]"
        :key="card.label"
        style="
          background:#fff;border:1px solid #E2E8F0;border-radius:12px;
          padding:14px 16px;display:flex;align-items:center;gap:12px;
          box-shadow:0 1px 4px rgba(15,23,42,0.05);
          transition:box-shadow 0.2s,transform 0.2s;cursor:default;
        "
        @mouseover="($event.currentTarget as HTMLElement).style.boxShadow='0 6px 20px rgba(15,23,42,0.09)';($event.currentTarget as HTMLElement).style.transform='translateY(-2px)'"
        @mouseleave="($event.currentTarget as HTMLElement).style.boxShadow='0 1px 4px rgba(15,23,42,0.05)';($event.currentTarget as HTMLElement).style.transform='translateY(0)'"
      >
        <div :style="`width:36px;height:36px;border-radius:9px;background:${card.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0;`">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :stroke="card.color" stroke-width="2"><path :d="card.icon"/></svg>
        </div>
        <div>
          <div style="font-size:22px;font-weight:800;color:#0F172A;line-height:1;">{{ card.value }}</div>
          <div style="font-size:11px;color:#64748B;margin-top:2px;font-weight:500;white-space:nowrap;">{{ card.label }}</div>
        </div>
      </div>
    </div>

    <!-- ── Tabs + Toolbar ─────────────────────────────────────── -->
    <div style="background:#fff;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(15,23,42,0.05);">

      <!-- Tab Bar -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:0 20px;border-bottom:1px solid #F1F5F9;gap:16px;">
        <div style="display:flex;gap:0;">
          <button
            v-for="tab in [
              { key: 'all',      label: 'All Tickets' },
              { key: 'open',     label: 'Open / In Progress' },
              { key: 'pending',  label: 'Pending' },
              { key: 'resolved', label: 'Resolved / Closed' },
            ]"
            :key="tab.key"
            @click="activeTab = tab.key as any"
            :style="`
              padding:14px 16px;font-size:13px;font-weight:600;
              color:${activeTab === tab.key ? '#6366F1' : '#64748B'};
              background:transparent;border:none;cursor:pointer;
              border-bottom:${activeTab === tab.key ? '2.5px solid #6366F1' : '2.5px solid transparent'};
              transition:all 0.15s;white-space:nowrap;display:flex;align-items:center;gap:6px;
            `"
          >
            {{ tab.label }}
            <span :style="`
              font-size:11px;font-weight:700;padding:2px 7px;border-radius:999px;
              ${activeTab === tab.key ? 'background:#EEF2FF;color:#6366F1;' : 'background:#F1F5F9;color:#94A3B8;'}
            `">{{ tabCount(tab.key) }}</span>
          </button>
        </div>

        <!-- Right side: search + filters -->
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;">
          <!-- Search -->
          <div style="position:relative;">
            <svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search tickets..."
              style="padding:8px 12px 8px 32px;font-size:13px;color:#334155;background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;width:200px;box-sizing:border-box;transition:all 0.15s;"
              @focus="onFocus" @blur="onBlur"
            >
          </div>

          <!-- Status filter -->
          <select v-model="filterStatus"
            style="padding:8px 12px;font-size:13px;color:#334155;background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;cursor:pointer;"
            @focus="onFocus" @blur="onBlur">
            <option v-for="s in statuses" :key="s" :value="s">{{ s === 'All' ? 'All Status' : s }}</option>
          </select>

          <!-- Priority filter -->
          <select v-model="filterPriority"
            style="padding:8px 12px;font-size:13px;color:#334155;background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;cursor:pointer;"
            @focus="onFocus" @blur="onBlur">
            <option v-for="p in priorities" :key="p" :value="p">{{ p === 'All' ? 'All Priority' : p }}</option>
          </select>

          <!-- Assignee filter -->
          <select v-model="filterAssignee"
            style="padding:8px 12px;font-size:13px;color:#334155;background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;cursor:pointer;"
            @focus="onFocus" @blur="onBlur">
            <option value="All">All Agents</option>
            <option value="Assigned">Assigned</option>
            <option value="Unassigned">Unassigned</option>
          </select>

          <!-- Export button -->
          <button
            style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;font-size:13px;font-weight:600;color:#475569;background:#fff;border:1.5px solid #E2E8F0;border-radius:8px;cursor:pointer;transition:all 0.15s;"
            @mouseover="($event.currentTarget as HTMLElement).style.background='#F8FAFC'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background='#fff'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
        </div>
      </div>

      <!-- ── Table Header ──────────────────────────────────────── -->
      <div style="
        display:grid;grid-template-columns:120px 1fr 160px 160px 100px 90px 110px 40px;
        padding:10px 20px;
        background:#F8FAFC;border-bottom:1px solid #E2E8F0;
        font-size:11px;font-weight:700;color:#64748B;letter-spacing:0.07em;text-transform:uppercase;
      ">
        <div>Ticket ID</div>
        <div>Subject</div>
        <div>Requester</div>
        <div>Assigned To</div>
        <div>Priority</div>
        <div>Status</div>
        <div>Updated</div>
        <div></div>
      </div>

      <!-- ── Loading ───────────────────────────────────────────── -->
      <div v-if="ticketStore.isLoading" style="text-align:center;padding:60px 0;color:#94A3B8;">
        <svg style="animation:spin 1s linear infinite;margin:0 auto 12px;display:block;" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        <p style="font-size:14px;margin:0;">Loading tickets...</p>
      </div>

      <!-- ── Empty ─────────────────────────────────────────────── -->
      <div v-else-if="filteredTickets.length === 0" style="text-align:center;padding:60px 20px;">
        <svg style="margin:0 auto 16px;display:block;opacity:0.3;" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        <p style="color:#94A3B8;font-size:14px;margin:0;">No tickets match your filters.</p>
      </div>

      <!-- ── Ticket Rows ─────────────────────────────────────────── -->
      <div
        v-else
        v-for="(ticket, idx) in filteredTickets"
        :key="ticket.id"
        :style="`
          display:grid;grid-template-columns:120px 1fr 160px 160px 100px 90px 110px 40px;
          padding:14px 20px;align-items:center;cursor:pointer;
          border-bottom:${idx < filteredTickets.length - 1 ? '1px solid #F8FAFC' : 'none'};
          transition:background 0.15s;
        `"
        @click="goToTicket(ticket.id)"
        @mouseover="($event.currentTarget as HTMLElement).style.background='#FAFBFF'"
        @mouseleave="($event.currentTarget as HTMLElement).style.background='transparent'"
      >
        <!-- ID -->
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:12px;font-weight:700;font-family:monospace;color:#6366F1;">#{{ ticket.id }}</span>
          <span v-if="ticket.sla?.isBreached" title="SLA Breached" style="width:6px;height:6px;background:#EF4444;border-radius:50%;flex-shrink:0;"></span>
        </div>

        <!-- Subject + category -->
        <div style="min-width:0;padding-right:16px;">
          <div style="font-size:13px;font-weight:700;color:#0F172A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ ticket.title }}</div>
          <div style="font-size:11px;color:#94A3B8;margin-top:2px;">
            {{ (ticket as any).category || '' }}
            <span v-if="(ticket as any).department">· {{ (ticket as any).department }}</span>
          </div>
        </div>

        <!-- Requester -->
        <div style="display:flex;align-items:center;gap:8px;min-width:0;">
          <div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#6366F1,#8B5CF6);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0;">
            {{ ((ticket as any).requesterName || 'U').substring(0, 2).toUpperCase() }}
          </div>
          <span style="font-size:13px;color:#334155;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ (ticket as any).requesterName || ticket.requesterId }}</span>
        </div>

        <!-- Assigned To -->
        <div v-if="(ticket as any).assigneeName" @click.stop="openAssign(ticket)" style="display:flex;align-items:center;gap:8px;min-width:0;cursor:pointer;padding:2px 6px;border-radius:4px;" onmouseover="this.style.background='#F1F5F9'" onmouseleave="this.style.background='transparent'">
          <div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#10B981,#059669);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0;">
            {{ (ticket as any).assigneeName.substring(0, 2).toUpperCase() }}
          </div>
          <span style="font-size:13px;color:#334155;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ (ticket as any).assigneeName }}</span>
        </div>
        <div v-else style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:12px;color:#CBD5E1;font-style:italic;">Unassigned</span>
          <button
            style="font-size:11px;font-weight:600;color:#6366F1;background:#EEF2FF;border:none;border-radius:5px;padding:2px 8px;cursor:pointer;"
            @click.stop="openAssign(ticket)"
          >Assign</button>
        </div>

        <!-- Priority -->
        <div>
          <span :style="`
            display:inline-flex;align-items:center;gap:4px;
            font-size:12px;font-weight:700;padding:3px 10px;border-radius:999px;
            color:${priorityStyle(ticket.priority).color};background:${priorityStyle(ticket.priority).bg};
          `">
            <span :style="`width:5px;height:5px;border-radius:50%;background:${priorityStyle(ticket.priority).color};`"></span>
            {{ ticket.priority }}
          </span>
        </div>

        <!-- Status -->
        <div>
          <span :style="`
            display:inline-flex;align-items:center;gap:4px;
            font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px;white-space:nowrap;
            color:${statusStyle(ticket.status).color};background:${statusStyle(ticket.status).bg};
          `">
            <span :style="`width:5px;height:5px;border-radius:50%;background:${statusStyle(ticket.status).dot};flex-shrink:0;`"></span>
            {{ ticket.status }}
          </span>
        </div>

        <!-- Updated -->
        <div style="font-size:12px;color:#94A3B8;">{{ formatDate(ticket.updatedAt) }}</div>

        <!-- Actions -->
        <div style="display:flex;justify-content:flex-end;">
          <button
            style="width:28px;height:28px;border-radius:7px;border:1px solid #E2E8F0;background:#fff;color:#64748B;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s;"
            @click.stop="goToTicket(ticket.id)"
            @mouseover="($event.currentTarget as HTMLElement).style.background='#EEF2FF';($event.currentTarget as HTMLElement).style.color='#6366F1';($event.currentTarget as HTMLElement).style.borderColor='#C7D2FE'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background='#fff';($event.currentTarget as HTMLElement).style.color='#64748B';($event.currentTarget as HTMLElement).style.borderColor='#E2E8F0'"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      <!-- ── Table Footer ──────────────────────────────────────── -->
      <div style="padding:12px 20px;background:#F8FAFC;border-top:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#64748B;">
        <span>Showing <strong>{{ filteredTickets.length }}</strong> of <strong>{{ ticketStore.tickets.length }}</strong> tickets</span>
        <div style="display:flex;gap:4px;">
          <button style="width:28px;height:28px;border-radius:6px;border:1px solid #E2E8F0;background:#fff;color:#64748B;cursor:pointer;display:flex;align-items:center;justify-content:center;" disabled>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button style="width:28px;height:28px;border-radius:6px;border:none;background:#6366F1;color:#fff;cursor:pointer;font-size:12px;font-weight:700;">1</button>
          <button style="width:28px;height:28px;border-radius:6px;border:1px solid #E2E8F0;background:#fff;color:#64748B;cursor:pointer;display:flex;align-items:center;justify-content:center;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Assign SlideOver -->
    <SlideOver :show="showAssign" title="Assign Ticket" @close="showAssign = false">
      <template #content>
        <div class="space-y-4">
          <p class="text-sm text-gray-600">Assigning ticket: <strong>#{{ assigningTicket?.id }}</strong></p>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Select Agent</label>
            <select v-model="selectedAssigneeId" class="form-select w-full">
              <option value="">-- Unassigned --</option>
              <option v-for="agent in userStore.users.filter(u => u.role.includes('Agent') || u.role.includes('Admin'))" :key="agent.id" :value="agent.id">
                {{ agent.name }} ({{ agent.role }})
              </option>
            </select>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-secondary" @click="showAssign = false">Cancel</button>
        <button class="btn btn-primary" @click="handleAssign">Confirm Assignment</button>
      </template>
    </SlideOver>
  </div>
</template>

<style>
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
