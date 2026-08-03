<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { AuditLogService } from '../../services/OtherServices'
import type { AuditLog } from '../../types/AuditLog'
import { formatDistanceToNow } from 'date-fns'

const logs = ref<AuditLog[]>([])
const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  try {
    logs.value = await AuditLogService.getAll()
  } finally {
    isLoading.value = false
  }
})

const sortedLogs = computed(() => {
  return [...logs.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

function timeAgo(value: string) {
  return formatDistanceToNow(new Date(value), { addSuffix: true })
}

const stats = computed(() => {
  const today = new Date().toDateString()
  return {
    total: sortedLogs.value.length,
    privileged: sortedLogs.value.filter(x =>
      x.action === 'PERMISSION_CHANGED' ||
      x.action === 'SENSITIVE_QUEUE_VIEWED' ||
      x.action === 'AUTH_MFA_VERIFIED'
    ).length,
    today: sortedLogs.value.filter(x => new Date(x.createdAt).toDateString() === today).length
  }
})

function actionBadge(action: string) {
  if (action === 'PERMISSION_CHANGED') return 'background:#EEF2FF;color:#4F46E5;border-color:#C7D2FE;'
  if (action === 'TICKET_STATUS_TRANSITION') return 'background:#ECFDF5;color:#047857;border-color:#A7F3D0;'
  if (action === 'AUTH_LOGIN_FAILURE') return 'background:#FEF2F2;color:#B91C1C;border-color:#FECACA;'
  if (action === 'AUTH_MFA_VERIFIED') return 'background:#FFF7ED;color:#B45309;border-color:#FED7AA;'
  if (action === 'SENSITIVE_QUEUE_VIEWED') return 'background:#F5F3FF;color:#6D28D9;border-color:#DDD6FE;'
  return 'background:#F8FAFC;color:#475569;border-color:#E2E8F0;'
}
</script>

<template>
  <div>
    <div class="mb-6 animate-slide-up">
      <h1 class="text-2xl font-bold text-gray-900">Audit Logs</h1>
      <p class="text-gray-500 mt-1">Track authentication events, privileged access, and ticket workflow operations.</p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:22px;animation-delay: 30ms;" class="animate-slide-up">
      <div
        v-for="card in [
          { label:'Total Events',      value: stats.total,      icon:'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18', color:'#6366F1', bg:'#EEF2FF' },
          { label:'Privileged Actions',value: stats.privileged, icon:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', color:'#8B5CF6', bg:'#F5F3FF' },
          { label:'Events Today',      value: stats.today,      icon:'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z', color:'#10B981', bg:'#ECFDF5' }
        ]"
        :key="card.label"
        style="
          background:#fff;border:1px solid #E2E8F0;border-radius:12px;
          padding:16px 20px;display:flex;align-items:center;gap:14px;
          box-shadow:0 1px 4px rgba(15,23,42,0.05);
          transition:box-shadow 0.2s,transform 0.2s;cursor:default;
        "
        @mouseover="($event.currentTarget as HTMLElement).style.boxShadow='0 6px 20px rgba(15,23,42,0.09)';($event.currentTarget as HTMLElement).style.transform='translateY(-2px)'"
        @mouseleave="($event.currentTarget as HTMLElement).style.boxShadow='0 1px 4px rgba(15,23,42,0.05)';($event.currentTarget as HTMLElement).style.transform='translateY(0)'"
      >
        <div :style="`width:42px;height:42px;border-radius:10px;background:${card.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0;`">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="card.color" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" :d="card.icon"/></svg>
        </div>
        <div>
          <div style="font-size:24px;font-weight:800;color:#0F172A;line-height:1;">{{ card.value }}</div>
          <div style="font-size:12px;color:#64748B;margin-top:4px;font-weight:600;white-space:nowrap;text-transform:uppercase;letter-spacing:0.04em;">{{ card.label }}</div>
        </div>
      </div>
    </div>

    <!-- ── Table ─────────────────────────────────────────────── -->
    <div
      class="animate-slide-up"
      style="
        animation-delay: 60ms;
        background:#fff;
        border:1px solid #E2E8F0;
        border-radius:12px;
        overflow:hidden;
        box-shadow:0 1px 4px rgba(15,23,42,0.05);
      "
    >
      <div style="display:grid;grid-template-columns:180px 200px 180px 1fr 220px 120px;padding:12px 20px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;font-size:11px;font-weight:700;color:#64748B;letter-spacing:.08em;text-transform:uppercase;">
        <div>Timestamp</div>
        <div>Actor</div>
        <div>Action</div>
        <div>Details</div>
        <div>Target</div>
        <div>IP</div>
      </div>

      <div v-if="isLoading" style="text-align:center;padding:60px 0;color:#94A3B8;">
        <svg style="animation:spin 1s linear infinite;margin:0 auto 12px;display:block;" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        <p style="font-size:14px;margin:0;">Loading audit events...</p>
      </div>
      <div v-else-if="sortedLogs.length === 0" style="text-align:center;padding:60px 20px;">
        <svg style="margin:0 auto 16px;display:block;opacity:0.3;" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        <p style="color:#94A3B8;font-size:14px;margin:0;">No audit logs found.</p>
      </div>

      <div
        v-else
        v-for="(item, idx) in sortedLogs"
        :key="item.id"
        :style="`
          display:grid;
          grid-template-columns:180px 200px 180px 1fr 220px 120px;
          padding:14px 20px;
          align-items:center;
          border-bottom:${idx < sortedLogs.length - 1 ? '1px solid #F1F5F9' : 'none'};
          transition:background .15s;
        `"
        @mouseover="($event.currentTarget as HTMLElement).style.background='#FAFBFF'"
        @mouseleave="($event.currentTarget as HTMLElement).style.background='transparent'"
      >
        <div>
          <div style="font-size:13px;font-weight:700;color:#0F172A;">{{ new Date(item.createdAt).toLocaleString(undefined, { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) }}</div>
          <div style="font-size:11px;color:#94A3B8;margin-top:2px;">{{ timeAgo(item.createdAt) }}</div>
        </div>

        <div>
          <div style="font-size:13px;font-weight:600;color:#1E293B;">{{ item.actorId }}</div>
          <div style="font-size:11px;color:#64748B;margin-top:2px;">{{ item.actorRole }}</div>
        </div>

        <div>
          <span
            :style="`
              display:inline-flex;
              align-items:center;
              padding:3px 8px;
              border-radius:6px;
              border:1px solid;
              font-size:11px;
              font-weight:700;
              ${actionBadge(item.action)}
            `"
          >
            {{ item.action.replace(/_/g, ' ') }}
          </span>
        </div>

        <div style="font-size:13px;color:#334155;">{{ item.details }}</div>

        <div style="font-size:12px;color:#475569;">
          <span style="font-weight:600;color:#0F172A;">{{ item.targetType }}</span>
          <span style="color:#CBD5E1;margin:0 4px;">/</span>
          <span>{{ item.targetId }}</span>
        </div>

        <div>
          <span style="display:inline-flex;padding:3px 8px;border-radius:6px;background:#F1F5F9;border:1px solid #E2E8F0;font-size:11px;font-weight:600;color:#64748B;font-family:monospace;">
            {{ item.ipAddress }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
