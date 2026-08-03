<script setup lang="ts">
import { onMounted } from 'vue'
import { useTicketStore } from '../../stores/ticket'

const ticketStore = useTicketStore()

onMounted(async () => {
  await ticketStore.fetchAllTickets()
})

const defaultRecentTickets = [
  { id: 'TK-10532', title: 'VPN Connection Failed', requester: 'John Doe', status: 'Open', priority: 'High', updated: '2m ago' },
  { id: 'TK-10531', title: 'Outlook Not Syncing', requester: 'Sarah Miller', status: 'In Progress', priority: 'Medium', updated: '15m ago' },
  { id: 'TK-10530', title: 'Cannot Access Shared Drive', requester: 'Robert Brown', status: 'Pending', priority: 'Medium', updated: '1h ago' },
  { id: 'TK-10529', title: 'New Laptop Setup Request', requester: 'Emily Johnson', status: 'Open', priority: 'Low', updated: '1h ago' },
  { id: 'TK-10528', title: 'Software Installation', requester: 'Michael Wong', status: 'In Progress', priority: 'High', updated: '2h ago' },
  { id: 'TK-10527', title: 'Printer Not Working', requester: 'David Clark', status: 'Pending', priority: 'Low', updated: '3h ago' },
  { id: 'TK-10526', title: 'Request for Admin Access', requester: 'Alicia Lee', status: 'Open', priority: 'High', updated: '3h ago' }
]



const totalTickets = 324
const openTickets = 128
const inProgressTickets = 56
const overdueTickets = 18
const resolvedTickets = 32

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Open': return 'badge-open'
    case 'In Progress': return 'badge-inprogress'
    case 'Pending': return 'badge-pending'
    case 'Resolved': return 'badge-resolved'
    case 'Closed': return 'badge-closed'
    default: return 'badge-open'
  }
}
</script>

<template>
  <div>
    <!-- KPI Cards -->
    <div class="grid grid-cols-5 gap-5 mb-6 stagger">
      <div class="kpi-card animate-slide-up">
        <div class="kpi-icon kpi-icon-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg></div>
        <div class="kpi-info"><div class="kpi-label">Total Tickets</div><div class="kpi-value">{{ totalTickets }}</div><div class="kpi-trend kpi-trend-up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>↗ 12% from last week</div></div>
      </div>
      <div class="kpi-card animate-slide-up">
        <div class="kpi-icon kpi-icon-green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg></div>
        <div class="kpi-info"><div class="kpi-label">Open Tickets</div><div class="kpi-value">{{ openTickets }}</div><div class="kpi-trend kpi-trend-up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>↗ 8% from last week</div></div>
      </div>
      <div class="kpi-card animate-slide-up">
        <div class="kpi-icon kpi-icon-orange"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 16 14"/></svg></div>
        <div class="kpi-info"><div class="kpi-label">In Progress</div><div class="kpi-value">{{ inProgressTickets }}</div><div class="kpi-trend kpi-trend-down"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/></svg>↘ 5% from last week</div></div>
      </div>
      <div class="kpi-card animate-slide-up">
        <div class="kpi-icon kpi-icon-red"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
        <div class="kpi-info"><div class="kpi-label">Overdue Tickets</div><div class="kpi-value">{{ overdueTickets }}</div><div class="kpi-trend kpi-trend-down"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/></svg>↘ 3% from last week</div></div>
      </div>
      <div class="kpi-card animate-slide-up">
        <div class="kpi-icon kpi-icon-purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
        <div class="kpi-info"><div class="kpi-label">Resolved Today</div><div class="kpi-value">{{ resolvedTickets }}</div><div class="kpi-trend kpi-trend-up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>↗ 18% from yesterday</div></div>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-6">
      <!-- Left Column -->
      <div class="col-span-8">
        <!-- Recent Tickets Table -->
        <div class="table-container mb-6 animate-slide-up">
          <div class="table-header">
            <h2 class="table-title">Recent Tickets</h2>
            <router-link :to="{ name: 'agent.tickets' }" class="table-link">View All Tickets</router-link>
          </div>
          <div class="table-tabs">
            <button class="table-tab active">All Tickets</button>
            <button class="table-tab">My Queue</button>
            <button class="table-tab">Unassigned</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject</th>
                <th>Requester</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ticket in defaultRecentTickets" :key="ticket.id">
                <td><a href="#" class="table-ticket-id">#{{ ticket.id }}</a></td>
                <td class="font-medium text-gray-900">{{ ticket.title }}</td>
                <td>{{ ticket.requester }}</td>
                <td><span class="badge" :class="getStatusClass(ticket.status)">{{ ticket.status }}</span></td>
                <td><span class="priority"><span class="priority-dot" :class="`priority-dot-${ticket.priority.toLowerCase()}`"></span> {{ ticket.priority }}</span></td>
                <td class="text-sm text-gray-500">{{ ticket.updated }}</td>
                <td class="text-gray-400"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></td>
              </tr>
            </tbody>
          </table>
          <div class="flex justify-center py-4 border-t border-gray-100">
            <router-link :to="{ name: 'agent.tickets' }" class="btn btn-ghost btn-sm">View All Tickets <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></router-link>
          </div>
        </div>

        <!-- Bottom Row: Unassigned + Chart -->
        <div class="grid grid-cols-2 gap-6">
          <!-- Unassigned -->
          <div class="card card-no-hover animate-slide-up">
            <div class="card-header" style="padding: 16px 20px;">
              <h3 class="text-[15px] font-semibold text-gray-900">Unassigned Tickets <span class="ml-2 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">7</span></h3>
              <router-link :to="{ name: 'agent.tickets', query: { queue: 'unassigned' } }" class="text-sm font-medium text-blue-600">View All</router-link>
            </div>
            <div class="card-body" style="padding: 8px 20px 16px;">
              <div class="space-y-3">
                <div class="flex items-center gap-3 py-2">
                  <a href="#" class="table-ticket-id text-sm">#TK-10524</a>
                  <span class="flex-1 text-sm text-gray-700 truncate">Login Issue – CRM System</span>
                  <span class="priority text-xs"><span class="priority-dot priority-dot-medium" style="width:6px;height:6px;"></span> Medium</span>
                  <span class="text-xs text-gray-400">30m ago</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </div>
                <div class="flex items-center gap-3 py-2">
                  <a href="#" class="table-ticket-id text-sm">#TK-10523</a>
                  <span class="flex-1 text-sm text-gray-700 truncate">TeamViewer Access Request</span>
                  <span class="priority text-xs"><span class="priority-dot priority-dot-low" style="width:6px;height:6px;"></span> Low</span>
                  <span class="text-xs text-gray-400">45m ago</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </div>
                <div class="flex items-center gap-3 py-2">
                  <a href="#" class="table-ticket-id text-sm">#TK-10522</a>
                  <span class="flex-1 text-sm text-gray-700 truncate">Issue with Slack Notifications</span>
                  <span class="priority text-xs"><span class="priority-dot priority-dot-medium" style="width:6px;height:6px;"></span> Medium</span>
                  <span class="text-xs text-gray-400">1h ago</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </div>
                <div class="flex items-center gap-3 py-2">
                  <a href="#" class="table-ticket-id text-sm">#TK-10521</a>
                  <span class="flex-1 text-sm text-gray-700 truncate">Unable to Connect to Wi-Fi</span>
                  <span class="priority text-xs"><span class="priority-dot priority-dot-high" style="width:6px;height:6px;"></span> High</span>
                  <span class="text-xs text-gray-400">2h ago</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Ticket Breakdown Chart -->
          <div class="card card-no-hover animate-slide-up">
            <div class="card-header" style="padding:16px 20px;">
              <h3 class="text-[15px] font-semibold text-gray-900">Ticket Breakdown</h3>
              <select class="form-select" style="width:130px;height:32px;font-size:12px;padding:0 28px 0 10px;">
                <option>This Week</option>
                <option>Last Week</option>
                <option>This Month</option>
              </select>
            </div>
            <div class="card-body" style="padding:16px 20px;">
              <!-- Simple CSS bar chart -->
              <div class="flex items-end gap-6 justify-center" style="height:180px;">
                <div class="flex flex-col items-center gap-2">
                  <span class="text-xs font-semibold text-gray-700">128</span>
                  <div style="width:48px;height:128px;background:var(--success-500);border-radius:6px 6px 0 0;"></div>
                  <span class="text-xs text-gray-500">Open</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <span class="text-xs font-semibold text-gray-700">56</span>
                  <div style="width:48px;height:56px;background:var(--primary-500);border-radius:6px 6px 0 0;"></div>
                  <span class="text-xs text-gray-500">In Progress</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <span class="text-xs font-semibold text-gray-700">74</span>
                  <div style="width:48px;height:74px;background:var(--warning-500);border-radius:6px 6px 0 0;"></div>
                  <span class="text-xs text-gray-500">Pending</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <span class="text-xs font-semibold text-gray-700">48</span>
                  <div style="width:48px;height:48px;background:var(--purple-500);border-radius:6px 6px 0 0;"></div>
                  <span class="text-xs text-gray-500">Resolved</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <span class="text-xs font-semibold text-gray-700">18</span>
                  <div style="width:48px;height:18px;background:var(--gray-400);border-radius:6px 6px 0 0;"></div>
                  <span class="text-xs text-gray-500">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="col-span-4">
        <!-- Tickets by Status (Donut) -->
        <div class="card card-no-hover mb-6 animate-slide-up">
          <div class="card-header" style="padding:16px 20px;">
            <h3 class="text-[15px] font-semibold text-gray-900">Tickets by Status</h3>
          </div>
          <div class="card-body" style="padding:20px;">
            <div class="flex items-center gap-6">
              <!-- CSS Donut -->
              <div class="relative" style="width:140px;height:140px;flex-shrink:0;">
                <svg viewBox="0 0 36 36" style="width:140px;height:140px;transform:rotate(-90deg);">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" stroke-width="4"/>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" stroke-width="4" stroke-dasharray="34.3 65.7" stroke-dashoffset="0"/>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#3B82F6" stroke-width="4" stroke-dasharray="14.9 85.1" stroke-dashoffset="-34.3"/>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" stroke-width="4" stroke-dasharray="20.2 79.8" stroke-dashoffset="-49.2"/>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#8B5CF6" stroke-width="4" stroke-dasharray="13.2 86.8" stroke-dashoffset="-69.4"/>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#94A3B8" stroke-width="4" stroke-dasharray="5.3 94.7" stroke-dashoffset="-82.6"/>
                </svg>
                <div class="donut-center"><div class="donut-center-value" style="font-size:22px;">324</div><div class="donut-center-label">Total</div></div>
              </div>
              <div class="chart-legend" style="gap:8px;">
                <div class="chart-legend-item"><span class="chart-legend-dot" style="background:var(--success-500);"></span> Open <span class="chart-legend-value">128 (39%)</span></div>
                <div class="chart-legend-item"><span class="chart-legend-dot" style="background:var(--primary-500);"></span> In Progress <span class="chart-legend-value">56 (17%)</span></div>
                <div class="chart-legend-item"><span class="chart-legend-dot" style="background:var(--warning-500);"></span> Pending <span class="chart-legend-value">74 (23%)</span></div>
                <div class="chart-legend-item"><span class="chart-legend-dot" style="background:var(--purple-500);"></span> Resolved <span class="chart-legend-value">48 (15%)</span></div>
                <div class="chart-legend-item"><span class="chart-legend-dot" style="background:var(--gray-400);"></span> Closed <span class="chart-legend-value">18 (6%)</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- SLA Breaches -->
        <div class="card card-no-hover mb-6 animate-slide-up">
          <div class="card-header" style="padding:16px 20px;">
            <h3 class="text-[15px] font-semibold text-gray-900">SLA Breaches <span class="ml-2 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">3</span></h3>
            <a href="#" class="text-sm font-medium text-red-500">View All</a>
          </div>
          <div class="card-body" style="padding:8px 20px 16px;">
            <div class="sla-breach-item">
              <a href="#" class="sla-breach-id text-sm">#TK-10456</a>
              <span class="sla-breach-subject">Database Connection Issue</span>
              <span class="sla-breach-time"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Overdue by 2h 15m</span>
            </div>
            <div class="sla-breach-item">
              <a href="#" class="sla-breach-id text-sm">#TK-10423</a>
              <span class="sla-breach-subject">Email Delivery Failure</span>
              <span class="sla-breach-time"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Overdue by 1h 45m</span>
            </div>
            <div class="sla-breach-item">
              <a href="#" class="sla-breach-id text-sm">#TK-10411</a>
              <span class="sla-breach-subject">Network Access Problem</span>
              <span class="sla-breach-time"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Overdue by 30m</span>
            </div>
          </div>
        </div>

        <!-- Activity Feed -->
        <div class="card card-no-hover animate-slide-up">
          <div class="card-header" style="padding:16px 20px;">
            <h3 class="text-[15px] font-semibold text-gray-900">Activity Feed</h3>
            <a href="#" class="text-sm font-medium text-blue-600">View All</a>
          </div>
          <div class="card-body" style="padding:8px 20px 16px;">
            <div class="activity-item">
              <div class="activity-icon" style="background:var(--primary-50);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
              <div class="activity-content"><div class="activity-text"><strong>Sarah Miller</strong> replied to ticket <a href="#" class="text-blue-600">#TK-10518</a><br><span class="text-gray-500">Re: Outlook Not Syncing</span></div></div>
              <span class="activity-time">10m ago</span>
            </div>
            <div class="activity-item">
              <div class="activity-icon" style="background:var(--success-50);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
              <div class="activity-content"><div class="activity-text"><strong>You</strong> changed status of ticket <a href="#" class="text-blue-600">#TK-10516</a><br><span class="text-gray-500">New Laptop Setup Request</span></div></div>
              <span class="activity-time">25m ago</span>
            </div>
            <div class="activity-item">
              <div class="activity-icon" style="background:var(--warning-50);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
              <div class="activity-content"><div class="activity-text"><strong>Robert Brown</strong> created ticket <a href="#" class="text-blue-600">#TK-10520</a><br><span class="text-gray-500">Cannot Access Shared Drive</span></div></div>
              <span class="activity-time">1h ago</span>
            </div>
            <div class="activity-item">
              <div class="activity-icon" style="background:var(--success-50);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
              <div class="activity-content"><div class="activity-text">Ticket <a href="#" class="text-blue-600">#TK-10515</a> was resolved<br><span class="text-gray-500">Printer Not Working</span></div></div>
              <span class="activity-time">2h ago</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
