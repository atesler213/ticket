<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLicenseStore } from '../../stores/license'
import SlideOver from '../../components/admin/SlideOver.vue'
import type { License, LicenseType, LicenseStatus, LicenseCategory } from '../../types/License'

const licenseStore = useLicenseStore()

onMounted(async () => {
  await licenseStore.fetchLicenses()
})

// ── Filters ──────────────────────────────────────────────────────
const searchQuery = ref('')
const filterStatus = ref<LicenseStatus | 'All'>('All')
const filterCategory = ref<LicenseCategory | 'All'>('All')

const statuses: (LicenseStatus | 'All')[] = ['All', 'Active', 'Expiring Soon', 'Expired', 'Over-capacity', 'Unassigned']
const categories: (LicenseCategory | 'All')[] = ['All', 'SaaS', 'Desktop App', 'OS']
const types: LicenseType[] = ['Per-Seat', 'Site License', 'Subscription', 'Concurrent', 'Perpetual']

const filteredLicenses = computed(() => {
  return licenseStore.licenses.filter(l => {
    const q = searchQuery.value.toLowerCase()
    const matchSearch = !q ||
      l.softwareName.toLowerCase().includes(q) ||
      l.vendor.toLowerCase().includes(q) ||
      (l.licenseKey || '').toLowerCase().includes(q)
    const matchStatus = filterStatus.value === 'All' || l.status === filterStatus.value
    const matchCat = filterCategory.value === 'All' || l.category === filterCategory.value
    return matchSearch && matchStatus && matchCat
  })
})

// ── Modals & Drawers ─────────────────────────────────────────────
const showForm = ref(false)
const showAssign = ref(false)
const showDetail = ref(false)

const isEditing = ref(false)
const selectedLicense = ref<License | null>(null)

const formData = ref<Partial<License>>({
  softwareName: '', vendor: '', type: 'Subscription', status: 'Active', category: 'SaaS',
  totalSeats: 1, assignedSeats: 0, costPerSeat: 0, monthlyCost: 0,
  expirationDate: '', purchaseDate: '', licenseKey: ''
})

const assignData = ref({
  userId: '',
  userName: '',
  department: 'Engineering'
})

// Mock users for assignment dropdown
const mockUsers = [
  { id: 'u1', name: 'Alice Smith', department: 'Engineering' },
  { id: 'u2', name: 'Bob Jones', department: 'Sales' },
  { id: 'u3', name: 'Charlie Brown', department: 'Marketing' },
  { id: 'u4', name: 'Diana Prince', department: 'Executive' },
  { id: 'u5', name: 'Evan Wright', department: 'IT' },
]

function openCreate() {
  isEditing.value = false
  formData.value = {
    softwareName: '', vendor: '', type: 'Subscription', status: 'Active', category: 'SaaS',
    totalSeats: 1, assignedSeats: 0, costPerSeat: 0, monthlyCost: 0,
    expirationDate: '', purchaseDate: '', licenseKey: ''
  }
  showForm.value = true
}

function openEdit(lic: License) {
  isEditing.value = true
  formData.value = { ...lic }
  showForm.value = true
}

function openAssign(lic: License) {
  selectedLicense.value = lic
  assignData.value = { userId: '', userName: '', department: 'Engineering' }
  showAssign.value = true
}

function openDetail(lic: License) {
  selectedLicense.value = lic
  showDetail.value = true
}

async function handleSave() {
  // auto calc monthly cost if not set correctly
  if (formData.value.costPerSeat && formData.value.totalSeats) {
    formData.value.monthlyCost = formData.value.costPerSeat * formData.value.totalSeats
  }
  
  if (isEditing.value && formData.value.id) {
    await licenseStore.updateLicense(formData.value.id, formData.value)
  } else {
    await licenseStore.createLicense(formData.value)
  }
  showForm.value = false
}

async function handleAssign() {
  if (!selectedLicense.value || !assignData.value.userId) return
  const user = mockUsers.find(u => u.id === assignData.value.userId)
  if (user) {
    await licenseStore.assignUserToLicense(selectedLicense.value.id, user)
  }
  showAssign.value = false
  // Re-fetch selected license for detail view update
  selectedLicense.value = licenseStore.licenses.find(l => l.id === selectedLicense.value!.id) || null
}

async function handleUnassign(userId: string) {
  if (!selectedLicense.value) return
  await licenseStore.unassignUserFromLicense(selectedLicense.value.id, userId)
  selectedLicense.value = licenseStore.licenses.find(l => l.id === selectedLicense.value!.id) || null
}

async function handleDelete(id: string) {
  if (confirm('Are you sure you want to delete this license?')) {
    await licenseStore.deleteLicense(id)
    if (selectedLicense.value?.id === id) showDetail.value = false
  }
}

// ── Visual Helpers ───────────────────────────────────────────────
function statusStyle(status: LicenseStatus) {
  const map: Record<LicenseStatus, { bg: string; color: string; dot: string }> = {
    'Active':        { bg: '#ECFDF5', color: '#10B981', dot: '#059669' },
    'Expiring Soon': { bg: '#FFF7ED', color: '#D97706', dot: '#B45309' },
    'Expired':       { bg: '#FEF2F2', color: '#EF4444', dot: '#B91C1C' },
    'Over-capacity': { bg: '#FDF4FF', color: '#C026D3', dot: '#A21CAF' },
    'Unassigned':    { bg: '#F1F5F9', color: '#64748B', dot: '#475569' }
  }
  return map[status] || map.Active
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatCurrency(val: number | undefined): string {
  if (val === undefined) return '$0'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}

function getVendorLogoInitials(vendor: string) {
  return vendor.substring(0, 2).toUpperCase()
}

// Input focus helpers
function onFocus(e: Event) {
  const el = e.target as HTMLElement
  el.style.borderColor = '#6366F1'
  el.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'
  el.style.outline = 'none'
}
function onBlur(e: Event) {
  const el = e.target as HTMLElement
  el.style.borderColor = '#E2E8F0'
  el.style.boxShadow = 'none'
}
</script>

<template>
  <div>
    <div class="mb-6 animate-slide-up" style="display:flex; justify-content:space-between; align-items:flex-end;">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Software & SaaS Licenses</h1>
        <p class="text-gray-500 mt-1">Manage software entitlements, allocations, and track upcoming renewals.</p>
      </div>
      <div style="display:flex; gap:12px;">
        <button class="btn btn-secondary shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          Export CSV
        </button>
        <button @click="openCreate" class="btn btn-primary shadow-md" style="background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="mr-2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add License
        </button>
      </div>
    </div>

    <!-- ── KPI Stats ─────────────────────────────────────────── -->
    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px;" class="stagger">
      <div
        v-for="(card, i) in [
          { label: 'Total Licenses', value: licenseStore.stats.totalLicenses, icon: 'M4 6h16M4 12h16M4 18h7', color: '#6366F1', bg: '#EEF2FF', alert: false },
          { label: 'Assigned Seats', value: licenseStore.stats.assigned, icon: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M8.5 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M20 8v6M23 11h-6', color: '#10B981', bg: '#ECFDF5', alert: false },
          { label: 'Available Seats',value: licenseStore.stats.available, icon: 'M22 12h-4l-3 9L9 3l-3 9H2', color: '#3B82F6', bg: '#EFF6FF', alert: false },
          { label: 'Expiring < 30d', value: licenseStore.stats.expiringSoon, icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: '#F59E0B', bg: '#FFF7ED', alert: licenseStore.stats.expiringSoon > 0 },
          { label: 'Monthly Cost',   value: formatCurrency(licenseStore.stats.totalMonthlyCost), icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', color: '#8B5CF6', bg: '#F5F3FF', alert: false },
        ]"
        :key="i"
        class="animate-slide-up"
        style="
          background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px;
          display: flex; align-items: center; gap: 14px; position: relative; overflow: hidden;
          box-shadow: 0 1px 4px rgba(15,23,42,0.05); transition: box-shadow 0.2s, transform 0.2s;
        "
        @mouseover="($event.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(15,23,42,0.09)'; ($event.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'"
        @mouseleave="($event.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(15,23,42,0.05)'; ($event.currentTarget as HTMLElement).style.transform = 'translateY(0)'"
      >
        <div v-if="card.alert" style="position:absolute;top:0;right:0;width:40px;height:40px;background:linear-gradient(135deg, transparent 50%, #FEF2F2 50%);border-top-right-radius:12px;"></div>
        <div v-if="card.alert" style="position:absolute;top:6px;right:6px;width:8px;height:8px;background:#EF4444;border-radius:50%;box-shadow:0 0 0 2px #fff;"></div>
        
        <div :style="`width:44px;height:44px;border-radius:12px;background:${card.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0;`">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="card.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path :d="card.icon"/>
          </svg>
        </div>
        <div>
          <div style="font-size:24px;font-weight:800;color:#0F172A;line-height:1;">{{ card.value }}</div>
          <div style="font-size:12px;color:#64748B;margin-top:4px;font-weight:600;">{{ card.label }}</div>
        </div>
      </div>
    </div>

    <!-- ── Toolbar ───────────────────────────────────────────── -->
    <div style="
      background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px 20px;
      display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
      box-shadow: 0 1px 4px rgba(15,23,42,0.05); flex-wrap: wrap;
    " class="animate-slide-up">
      <div style="position:relative;flex:1;min-width:250px;">
        <svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);pointer-events:none;" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="searchQuery" type="text" placeholder="Search software name, vendor, or license key..."
          style="
            width:100%;padding:9px 14px 9px 38px; font-size:13px;color:#334155;
            background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:8px;
            outline:none;box-sizing:border-box;transition:all 0.15s;
          "
          @focus="onFocus" @blur="onBlur"
        >
      </div>
      <select v-model="filterCategory" style="padding:9px 14px;font-size:13px;font-weight:500;color:#334155;background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;cursor:pointer;min-width:130px;" @focus="onFocus" @blur="onBlur">
        <option v-for="c in categories" :key="c" :value="c">{{ c === 'All' ? 'All Categories' : c }}</option>
      </select>
      <select v-model="filterStatus" style="padding:9px 14px;font-size:13px;font-weight:500;color:#334155;background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;cursor:pointer;min-width:140px;" @focus="onFocus" @blur="onBlur">
        <option v-for="s in statuses" :key="s" :value="s">{{ s === 'All' ? 'All Statuses' : s }}</option>
      </select>
    </div>

    <!-- ── Loading ────────────────────────────────────────────── -->
    <div v-if="licenseStore.isLoading" style="text-align:center;padding:60px 0;color:#94A3B8;">
      <svg style="animation:spin 1s linear infinite;margin:0 auto 12px;display:block;" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      <p style="font-size:14px;margin:0;">Loading licenses...</p>
    </div>

    <!-- ── Main Table ─────────────────────────────────────────── -->
    <div v-else class="animate-slide-up" style="background:#fff;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(15,23,42,0.05);">
      <!-- Table Header -->
      <div style="display:grid;grid-template-columns:2fr 1fr 1.5fr 1fr 1fr 1fr 80px; padding:14px 20px; background:#F8FAFC;border-bottom:1px solid #E2E8F0; font-size:11px;font-weight:700;color:#64748B;letter-spacing:0.08em;text-transform:uppercase;">
        <div>Software / Publisher</div>
        <div>Type & Category</div>
        <div>Seat Usage</div>
        <div>Assigned To</div>
        <div>Expiration</div>
        <div>Status</div>
        <div></div>
      </div>

      <div v-if="filteredLicenses.length === 0" style="text-align:center;padding:60px 20px;">
        <p style="color:#94A3B8;font-size:14px;margin:0;">No licenses found matching your criteria.</p>
      </div>

      <!-- Rows -->
      <div
        v-for="(lic, idx) in filteredLicenses" :key="lic.id"
        :style="`display:grid;grid-template-columns:2fr 1fr 1.5fr 1fr 1fr 1fr 80px; padding:16px 20px;align-items:center; border-bottom:${idx < filteredLicenses.length - 1 ? '1px solid #F1F5F9' : 'none'}; transition:background 0.15s;cursor:pointer;`"
        @mouseover="($event.currentTarget as HTMLElement).style.background='#FAFBFF'"
        @mouseleave="($event.currentTarget as HTMLElement).style.background='transparent'"
        @click="openDetail(lic)"
      >
        <!-- Software & Publisher -->
        <div style="display:flex;align-items:center;gap:12px;min-width:0;padding-right:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:#EEF2FF;color:#4F46E5;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0;">
            {{ getVendorLogoInitials(lic.vendor) }}
          </div>
          <div style="min-width:0;">
            <div style="font-size:14px;font-weight:700;color:#0F172A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ lic.softwareName }}</div>
            <div style="font-size:12px;color:#64748B;margin-top:2px;">{{ lic.vendor }}</div>
          </div>
        </div>

        <!-- Type & Category -->
        <div>
          <div style="font-size:13px;font-weight:600;color:#334155;">{{ lic.type }}</div>
          <div style="font-size:11px;color:#94A3B8;margin-top:2px;display:flex;align-items:center;gap:4px;">
             <svg v-if="lic.category==='SaaS'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
             <svg v-if="lic.category==='Desktop App'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
             <svg v-if="lic.category==='OS'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12H2M5 12a7 7 0 0 1 7-7 7 7 0 0 1 7 7 7 7 0 0 1-7 7 7 7 0 0 1-7-7M2 9h20M2 15h20"/></svg>
             {{ lic.category }}
          </div>
        </div>

        <!-- Usage Progress -->
        <div style="padding-right:24px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:6px;">
            <div style="font-size:12px;font-weight:600;color:#334155;">{{ lic.assignedSeats }} <span style="color:#94A3B8;font-weight:500;">/ {{ lic.totalSeats }}</span></div>
            <div style="font-size:11px;font-weight:600;" :style="{ color: lic.assignedSeats > lic.totalSeats ? '#EF4444' : '#64748B' }">
              {{ Math.round((lic.assignedSeats / lic.totalSeats) * 100) }}%
            </div>
          </div>
          <div style="width:100%;height:6px;background:#F1F5F9;border-radius:999px;overflow:hidden;">
            <div 
              style="height:100%;border-radius:999px;transition:width 0.3s ease;"
              :style="{ 
                width: `${Math.min(100, (lic.assignedSeats / lic.totalSeats) * 100)}%`,
                background: lic.assignedSeats > lic.totalSeats ? '#EF4444' : (lic.assignedSeats === lic.totalSeats ? '#F59E0B' : '#4F46E5')
              }"
            ></div>
          </div>
        </div>

        <!-- Assigned To -->
        <div>
          <div v-if="lic.assignedUsers && lic.assignedUsers.length > 0" style="display:flex;align-items:center;">
            <div style="display:flex;margin-right:8px;">
              <div v-for="(u, ui) in lic.assignedUsers.slice(0, 3)" :key="u.id" 
                style="width:28px;height:28px;border-radius:50%;background:#E2E8F0;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#475569;margin-left:-8px;"
                :style="{ marginLeft: ui === 0 ? '0' : '-8px', zIndex: 10 - ui }"
                :title="u.name">
                {{ u.name.substring(0, 2).toUpperCase() }}
              </div>
            </div>
            <span v-if="lic.assignedUsers.length > 3" style="font-size:12px;font-weight:600;color:#64748B;">+{{ lic.assignedUsers.length - 3 }}</span>
          </div>
          <span v-else style="font-size:13px;color:#CBD5E1;">None</span>
        </div>

        <!-- Expiration -->
        <div>
           <div style="font-size:13px;color:#0F172A;font-weight:500;">
             <span v-if="lic.status === 'Expiring Soon'" style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#F59E0B;margin-right:6px;"></span>
             <span v-else-if="lic.status === 'Expired'" style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#EF4444;margin-right:6px;"></span>
             {{ formatDate(lic.expirationDate) }}
           </div>
        </div>

        <!-- Status -->
        <div>
          <span :style="`display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;color:${statusStyle(lic.status).color};background:${statusStyle(lic.status).bg};`">
            <span :style="`width:6px;height:6px;border-radius:50%;background:${statusStyle(lic.status).dot};flex-shrink:0;`"></span>
            {{ lic.status }}
          </span>
        </div>

        <!-- Actions -->
        <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end;" @click.stop>
          <button style="width:30px;height:30px;border-radius:7px;border:1px solid #E2E8F0;background:#fff;color:#64748B;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s;" title="Assign User" @click="openAssign(lic)" @mouseover="($event.currentTarget as HTMLElement).style.background='#EEF2FF';($event.currentTarget as HTMLElement).style.color='#6366F1'" @mouseleave="($event.currentTarget as HTMLElement).style.background='#fff';($event.currentTarget as HTMLElement).style.color='#64748B'">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          </button>
          <button style="width:30px;height:30px;border-radius:7px;border:1px solid #E2E8F0;background:#fff;color:#64748B;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s;" title="Edit" @click="openEdit(lic)" @mouseover="($event.currentTarget as HTMLElement).style.background='#F8FAFC';($event.currentTarget as HTMLElement).style.color='#334155'" @mouseleave="($event.currentTarget as HTMLElement).style.background='#fff';($event.currentTarget as HTMLElement).style.color='#64748B'">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
      </div>
      <!-- Footer -->
      <div style="padding:12px 20px;background:#F8FAFC;border-top:1px solid #E2E8F0;font-size:12px;color:#64748B;">
        Showing <strong>{{ filteredLicenses.length }}</strong> of <strong>{{ licenseStore.licenses.length }}</strong> licenses
      </div>
    </div>

    <!-- ── Add / Edit Form Modal ──────────────────────────────── -->
    <SlideOver :show="showForm" :title="isEditing ? 'Edit License' : 'Add New License'" @close="showForm = false">
      <template #content>
        <div style="display:flex;flex-direction:column;gap:20px;">
          <!-- Software Name & Vendor -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div>
              <label style="display:block;font-size:12px;font-weight:600;color:#64748B;margin-bottom:6px;">Software Name</label>
              <input v-model="formData.softwareName" type="text" style="width:100%;padding:10px 14px;font-size:14px;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;" @focus="onFocus" @blur="onBlur">
            </div>
            <div>
              <label style="display:block;font-size:12px;font-weight:600;color:#64748B;margin-bottom:6px;">Vendor/Publisher</label>
              <input v-model="formData.vendor" type="text" style="width:100%;padding:10px 14px;font-size:14px;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;" @focus="onFocus" @blur="onBlur">
            </div>
          </div>
          <!-- Type & Category -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div>
              <label style="display:block;font-size:12px;font-weight:600;color:#64748B;margin-bottom:6px;">License Type</label>
              <select v-model="formData.type" style="width:100%;padding:10px 14px;font-size:14px;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;" @focus="onFocus" @blur="onBlur">
                <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div>
              <label style="display:block;font-size:12px;font-weight:600;color:#64748B;margin-bottom:6px;">Category</label>
              <select v-model="formData.category" style="width:100%;padding:10px 14px;font-size:14px;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;" @focus="onFocus" @blur="onBlur">
                <option v-for="c in categories.filter(x => x !== 'All')" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
          </div>
          <!-- Seats & Cost -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div>
              <label style="display:block;font-size:12px;font-weight:600;color:#64748B;margin-bottom:6px;">Total Seats</label>
              <input v-model.number="formData.totalSeats" type="number" style="width:100%;padding:10px 14px;font-size:14px;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;" @focus="onFocus" @blur="onBlur">
            </div>
            <div>
              <label style="display:block;font-size:12px;font-weight:600;color:#64748B;margin-bottom:6px;">Cost Per Seat ($)</label>
              <input v-model.number="formData.costPerSeat" type="number" style="width:100%;padding:10px 14px;font-size:14px;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;" @focus="onFocus" @blur="onBlur">
            </div>
          </div>
          <!-- Dates -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div>
              <label style="display:block;font-size:12px;font-weight:600;color:#64748B;margin-bottom:6px;">Purchase Date</label>
              <input v-model="formData.purchaseDate" type="date" style="width:100%;padding:10px 14px;font-size:14px;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;" @focus="onFocus" @blur="onBlur">
            </div>
            <div>
              <label style="display:block;font-size:12px;font-weight:600;color:#64748B;margin-bottom:6px;">Expiration Date</label>
              <input v-model="formData.expirationDate" type="date" style="width:100%;padding:10px 14px;font-size:14px;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;" @focus="onFocus" @blur="onBlur">
            </div>
          </div>
          <!-- License Key -->
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:#64748B;margin-bottom:6px;">License Key / Activation Code</label>
            <input v-model="formData.licenseKey" type="text" placeholder="XXXX-XXXX-XXXX-XXXX" style="width:100%;padding:10px 14px;font-size:14px;font-family:monospace;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;" @focus="onFocus" @blur="onBlur">
          </div>
          <!-- Status -->
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:#64748B;margin-bottom:6px;">Status</label>
            <select v-model="formData.status" style="width:100%;padding:10px 14px;font-size:14px;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;" @focus="onFocus" @blur="onBlur">
              <option v-for="s in statuses.filter(x => x !== 'All')" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>
      </template>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="showForm = false">Cancel</button>
        <button type="button" class="btn btn-primary shadow-md" style="background:linear-gradient(135deg,#6366F1 0%,#4F46E5 100%);" @click="handleSave">Save License</button>
      </template>
    </SlideOver>

    <!-- ── Assign Modal ───────────────────────────────────────── -->
    <SlideOver :show="showAssign" title="Assign License" @close="showAssign = false">
      <template #content>
        <div v-if="selectedLicense" style="display:flex;flex-direction:column;gap:20px;">
          <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:16px;">
            <div style="font-size:12px;color:#64748B;font-weight:600;text-transform:uppercase;margin-bottom:4px;">Target Software</div>
            <div style="font-size:16px;font-weight:700;color:#0F172A;">{{ selectedLicense.softwareName }}</div>
            <div style="font-size:13px;color:#475569;margin-top:8px;">Available Seats: <strong style="color:#10B981;">{{ Math.max(0, selectedLicense.totalSeats - selectedLicense.assignedSeats) }}</strong></div>
          </div>
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:#64748B;margin-bottom:6px;">Select User</label>
            <select v-model="assignData.userId" style="width:100%;padding:10px 14px;font-size:14px;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;" @focus="onFocus" @blur="onBlur">
              <option value="" disabled>-- Select a user --</option>
              <option v-for="u in mockUsers" :key="u.id" :value="u.id">{{ u.name }} ({{ u.department }})</option>
            </select>
          </div>
        </div>
      </template>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="showAssign = false">Cancel</button>
        <button type="button" class="btn btn-primary" :disabled="!assignData.userId" @click="handleAssign">Assign</button>
      </template>
    </SlideOver>

    <!-- ── License Details Drawer ─────────────────────────────── -->
    <SlideOver :show="showDetail" :title="selectedLicense?.softwareName || 'Details'" @close="showDetail = false">
      <template #content>
        <div v-if="selectedLicense" style="display:flex;flex-direction:column;gap:24px;">
          <!-- Header Info -->
          <div style="display:flex;gap:16px;align-items:flex-start;">
            <div style="width:56px;height:56px;border-radius:12px;background:#EEF2FF;color:#4F46E5;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;flex-shrink:0;">
              {{ getVendorLogoInitials(selectedLicense.vendor) }}
            </div>
            <div>
              <h2 style="font-size:20px;font-weight:800;color:#0F172A;line-height:1.2;">{{ selectedLicense.softwareName }}</h2>
              <p style="font-size:14px;color:#64748B;margin-top:4px;">{{ selectedLicense.vendor }} • {{ selectedLicense.category }}</p>
              <div style="margin-top:8px;">
                <span :style="`display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;color:${statusStyle(selectedLicense.status).color};background:${statusStyle(selectedLicense.status).bg};`">
                  <span :style="`width:6px;height:6px;border-radius:50%;background:${statusStyle(selectedLicense.status).dot};flex-shrink:0;`"></span>
                  {{ selectedLicense.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- License Specs Grid -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:16px;">
            <div>
              <div style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;">License Type</div>
              <div style="font-size:14px;font-weight:600;color:#0F172A;margin-top:2px;">{{ selectedLicense.type }}</div>
            </div>
            <div>
              <div style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;">License Key</div>
              <div style="font-size:13px;font-weight:600;color:#0F172A;font-family:monospace;margin-top:2px;">
                {{ selectedLicense.licenseKey || 'N/A' }}
              </div>
            </div>
            <div style="grid-column:1 / -1; height:1px; background:#E2E8F0; margin:4px 0;"></div>
            <div>
              <div style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;">Purchase Date</div>
              <div style="font-size:14px;font-weight:600;color:#0F172A;margin-top:2px;">{{ formatDate(selectedLicense.purchaseDate) }}</div>
            </div>
            <div>
              <div style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;">Expiration</div>
              <div style="font-size:14px;font-weight:600;color:#0F172A;margin-top:2px;" :style="{ color: selectedLicense.status === 'Expired' ? '#EF4444' : '#0F172A' }">
                {{ formatDate(selectedLicense.expirationDate) }}
              </div>
            </div>
            <div style="grid-column:1 / -1; height:1px; background:#E2E8F0; margin:4px 0;"></div>
            <div>
              <div style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;">Monthly Cost</div>
              <div style="font-size:14px;font-weight:600;color:#0F172A;margin-top:2px;">{{ formatCurrency(selectedLicense.monthlyCost) }} <span style="font-size:12px;color:#64748B;font-weight:400;">({{ formatCurrency(selectedLicense.costPerSeat) }}/seat)</span></div>
            </div>
          </div>

          <!-- Usage Metrics -->
          <div>
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:8px;">
              <h3 style="font-size:14px;font-weight:700;color:#0F172A;">Usage Allocation</h3>
              <div style="font-size:13px;font-weight:600;color:#334155;">{{ selectedLicense.assignedSeats }} / {{ selectedLicense.totalSeats }} Seats</div>
            </div>
            <div style="width:100%;height:10px;background:#F1F5F9;border-radius:999px;overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,0.05);">
              <div 
                style="height:100%;border-radius:999px;transition:width 0.3s ease;"
                :style="{ 
                  width: `${Math.min(100, (selectedLicense.assignedSeats / selectedLicense.totalSeats) * 100)}%`,
                  background: selectedLicense.assignedSeats > selectedLicense.totalSeats ? '#EF4444' : (selectedLicense.assignedSeats === selectedLicense.totalSeats ? '#F59E0B' : '#4F46E5')
                }"
              ></div>
            </div>
          </div>

          <!-- Assigned Users List -->
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <h3 style="font-size:14px;font-weight:700;color:#0F172A;">Assigned Users ({{ selectedLicense.assignedUsers?.length || 0 }})</h3>
              <button @click="openAssign(selectedLicense)" style="background:none;border:none;color:#4F46E5;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Assign
              </button>
            </div>
            
            <div v-if="!selectedLicense.assignedUsers || selectedLicense.assignedUsers.length === 0" style="padding:24px;text-align:center;background:#F8FAFC;border:1px dashed #CBD5E1;border-radius:8px;">
              <p style="font-size:13px;color:#94A3B8;margin:0;">No users assigned to this license yet.</p>
            </div>
            
            <div v-else style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">
              <div v-for="(user, i) in selectedLicense.assignedUsers" :key="user.id" 
                style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#fff;"
                :style="{ borderBottom: i < selectedLicense.assignedUsers.length - 1 ? '1px solid #F1F5F9' : 'none' }"
              >
                <div style="display:flex;align-items:center;gap:12px;">
                  <div style="width:32px;height:32px;border-radius:50%;background:#E2E8F0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#475569;">
                    {{ user.name.substring(0, 2).toUpperCase() }}
                  </div>
                  <div>
                    <div style="font-size:13px;font-weight:600;color:#0F172A;">{{ user.name }}</div>
                    <div style="font-size:11px;color:#64748B;">{{ user.department || 'Unknown Dept' }}</div>
                  </div>
                </div>
                <button 
                  @click="handleUnassign(user.id)"
                  style="width:28px;height:28px;border-radius:6px;border:none;background:#FEE2E2;color:#EF4444;display:flex;align-items:center;justify-content:center;cursor:pointer;"
                  title="Revoke License"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div style="margin-top:auto;padding-top:24px;display:flex;gap:12px;">
            <button class="btn btn-secondary" style="flex:1;justify-content:center;color:#EF4444;border-color:#FECACA;" @click="handleDelete(selectedLicense.id)">
              Delete License
            </button>
            <button class="btn btn-secondary" style="flex:1;justify-content:center;" @click="openEdit(selectedLicense)">
              Edit Details
            </button>
          </div>
        </div>
      </template>
    </SlideOver>

  </div>
</template>

<style>
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
