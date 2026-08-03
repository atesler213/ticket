<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAssetStore } from '../../stores/asset'
import SlideOver from '../../components/admin/SlideOver.vue'
import type { Asset, AssetType, AssetStatus } from '../../types/Asset'

const assetStore = useAssetStore()

onMounted(async () => {
  await assetStore.fetchAssets()
})

// ── Filters ──────────────────────────────────────────────────────
const searchQuery = ref('')
const filterType = ref<AssetType | 'All'>('All')
const filterStatus = ref<AssetStatus | 'All'>('All')

const assetTypes: (AssetType | 'All')[] = ['All', 'Laptop', 'Monitor', 'Phone', 'Printer', 'Server', 'Software', 'License', 'Accessory']
const assetStatuses: (AssetStatus | 'All')[] = ['All', 'In Use', 'Available', 'In Repair', 'Retired']

const filteredAssets = computed(() => {
  return assetStore.assets.filter(a => {
    const q = searchQuery.value.toLowerCase()
    const matchSearch = !q ||
      a.name.toLowerCase().includes(q) ||
      a.assetTag.toLowerCase().includes(q) ||
      (a.assignedToName || '').toLowerCase().includes(q) ||
      (a.serialNumber || '').toLowerCase().includes(q)
    const matchType = filterType.value === 'All' || a.type === filterType.value
    const matchStatus = filterStatus.value === 'All' || a.status === filterStatus.value
    return matchSearch && matchType && matchStatus
  })
})

// ── KPI stats ────────────────────────────────────────────────────
const stats = computed(() => {
  const all = assetStore.assets
  return {
    total: all.length,
    inUse: all.filter(a => a.status === 'In Use').length,
    available: all.filter(a => a.status === 'Available').length,
    inRepair: all.filter(a => a.status === 'In Repair').length,
    retired: all.filter(a => a.status === 'Retired').length,
  }
})

// ── SlideOver ────────────────────────────────────────────────────
const showForm = ref(false)
const isEditing = ref(false)
const formData = ref<Partial<Asset>>({
  name: '', assetTag: '', type: 'Laptop', status: 'Available',
  serialNumber: '', assignedToId: null, assignedToName: '', department: '',
  purchaseDate: '', warrantyExpiry: '',
})

function openCreate() {
  isEditing.value = false
  formData.value = {
    name: '', assetTag: '', type: 'Laptop', status: 'Available',
    serialNumber: '', assignedToId: null, assignedToName: '', department: '',
    purchaseDate: '', warrantyExpiry: '',
  }
  showForm.value = true
}

function openEdit(asset: Asset) {
  isEditing.value = true
  formData.value = { ...asset }
  showForm.value = true
}

async function handleSave() {
  if (isEditing.value && formData.value.id) {
    await assetStore.updateAsset(formData.value.id, formData.value)
  } else {
    await assetStore.createAsset(formData.value)
  }
  showForm.value = false
}

async function handleDelete(id: string) {
  if (confirm('Bu varlığı silmek istediğinize emin misiniz?')) {
    await assetStore.deleteAsset(id)
  }
}

// ── Visual helpers ───────────────────────────────────────────────
function typeIcon(type: AssetType): string {
  const icons: Record<AssetType, string> = {
    Laptop: 'M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16',
    Monitor: 'M8 21h8M12 17v4M3 5h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
    Phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.61 5.07a2 2 0 0 1 1.82-2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
    Printer: 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z',
    Server: 'M22 12H2M5 12a7 7 0 0 1 7-7 7 7 0 0 1 7 7 7 7 0 0 1-7 7 7 7 0 0 1-7-7M2 9h20M2 15h20',
    Software: 'M4 17l6-6-6-6M12 19h8',
    License: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z',
    Accessory: 'M4 6h16M4 12h16M4 18h7',
  }
  return icons[type] || icons.Accessory
}

function typeColor(type: AssetType): { bg: string; stroke: string } {
  const map: Record<AssetType, { bg: string; stroke: string }> = {
    Laptop:    { bg: '#EEF2FF', stroke: '#6366F1' },
    Monitor:   { bg: '#E0F2FE', stroke: '#0EA5E9' },
    Phone:     { bg: '#FEF3C7', stroke: '#F59E0B' },
    Printer:   { bg: '#F0FDF4', stroke: '#22C55E' },
    Server:    { bg: '#FDF4FF', stroke: '#A855F7' },
    Software:  { bg: '#FFF7ED', stroke: '#F97316' },
    License:   { bg: '#ECFDF5', stroke: '#10B981' },
    Accessory: { bg: '#F1F5F9', stroke: '#64748B' },
  }
  return map[type] || map.Accessory
}

interface StatusStyle { bg: string; color: string; dot: string }

function statusStyle(status: AssetStatus): StatusStyle {
  const map: Record<AssetStatus, StatusStyle> = {
    'In Use':    { bg: '#EFF6FF', color: '#2563EB', dot: '#3B82F6' },
    'Available': { bg: '#F0FDF4', color: '#16A34A', dot: '#22C55E' },
    'In Repair': { bg: '#FFF7ED', color: '#D97706', dot: '#F59E0B' },
    'Retired':   { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8' },
  }
  return map[status] || map.Retired
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric' })
}

function isWarrantyExpiringSoon(warrantyExpiry: string | null): boolean {
  if (!warrantyExpiry) return false
  const diff = new Date(warrantyExpiry).getTime() - Date.now()
  return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000
}

function isWarrantyExpired(warrantyExpiry: string | null): boolean {
  if (!warrantyExpiry) return false
  return new Date(warrantyExpiry).getTime() < Date.now()
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
    <!-- ── KPI Stats ─────────────────────────────────────────── -->
    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px;" class="stagger">
      <div
        v-for="(card, i) in [
          { label: 'Total Assets',    value: stats.total,    icon: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18', color: '#6366F1', bg: '#EEF2FF' },
          { label: 'In Use',         value: stats.inUse,    icon: 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z', color: '#3B82F6', bg: '#EFF6FF' },
          { label: 'Available',      value: stats.available,icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M8 12l2 2 4-4', color: '#10B981', bg: '#ECFDF5' },
          { label: 'In Repair',      value: stats.inRepair, icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z', color: '#F59E0B', bg: '#FFF7ED' },
          { label: 'Retired',        value: stats.retired,  icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z', color: '#94A3B8', bg: '#F1F5F9' },
        ]"
        :key="i"
        class="animate-slide-up"
        style="
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 1px 4px rgba(15,23,42,0.05);
          transition: box-shadow 0.2s, transform 0.2s;
        "
        @mouseover="($event.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(15,23,42,0.09)'; ($event.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'"
        @mouseleave="($event.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(15,23,42,0.05)'; ($event.currentTarget as HTMLElement).style.transform = 'translateY(0)'"
      >
        <div :style="`width:40px;height:40px;border-radius:10px;background:${card.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0;`">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="card.color" stroke-width="2">
            <path :d="card.icon"/>
          </svg>
        </div>
        <div>
          <div style="font-size:24px;font-weight:800;color:#0F172A;line-height:1;">{{ card.value }}</div>
          <div style="font-size:12px;color:#64748B;margin-top:2px;font-weight:500;">{{ card.label }}</div>
        </div>
      </div>
    </div>

    <!-- ── Toolbar ───────────────────────────────────────────── -->
    <div style="
      background: #fff;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      box-shadow: 0 1px 4px rgba(15,23,42,0.05);
      flex-wrap: wrap;
    " class="animate-slide-up">
      <!-- Search -->
      <div style="position:relative;flex:1;min-width:200px;">
        <svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);pointer-events:none;" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search assets, tags, serial numbers..."
          style="
            width:100%;padding:9px 14px 9px 38px;
            font-size:13px;color:#334155;
            background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:8px;
            outline:none;box-sizing:border-box;transition:all 0.15s;
          "
          @focus="onFocus" @blur="onBlur"
        >
      </div>

      <!-- Type filter -->
      <select
        v-model="filterType"
        style="padding:9px 14px;font-size:13px;font-weight:500;color:#334155;background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;cursor:pointer;min-width:130px;"
        @focus="onFocus" @blur="onBlur"
      >
        <option v-for="t in assetTypes" :key="t" :value="t">{{ t === 'All' ? 'All Types' : t }}</option>
      </select>

      <!-- Status filter -->
      <select
        v-model="filterStatus"
        style="padding:9px 14px;font-size:13px;font-weight:500;color:#334155;background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;cursor:pointer;min-width:140px;"
        @focus="onFocus" @blur="onBlur"
      >
        <option v-for="s in assetStatuses" :key="s" :value="s">{{ s === 'All' ? 'All Statuses' : s }}</option>
      </select>

      <!-- Add button -->
      <button
        @click="openCreate"
        style="
          display:inline-flex;align-items:center;gap:6px;
          padding:9px 16px;font-size:13px;font-weight:600;
          color:#fff;background:linear-gradient(135deg,#6366F1 0%,#4F46E5 100%);
          border:none;border-radius:8px;cursor:pointer;white-space:nowrap;
          box-shadow:0 2px 8px rgba(99,102,241,0.3);transition:all 0.15s;
        "
        @mouseover="($event.currentTarget as HTMLElement).style.boxShadow='0 4px 16px rgba(99,102,241,0.45)';($event.currentTarget as HTMLElement).style.transform='translateY(-1px)'"
        @mouseleave="($event.currentTarget as HTMLElement).style.boxShadow='0 2px 8px rgba(99,102,241,0.3)';($event.currentTarget as HTMLElement).style.transform='translateY(0)'"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Asset
      </button>
    </div>

    <!-- ── Loading ────────────────────────────────────────────── -->
    <div v-if="assetStore.isLoading" style="text-align:center;padding:60px 0;color:#94A3B8;">
      <svg style="animation:spin 1s linear infinite;margin:0 auto 12px;display:block;" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      <p style="font-size:14px;margin:0;">Loading assets...</p>
    </div>

    <!-- ── Table ──────────────────────────────────────────────── -->
    <div
      v-else
      class="animate-slide-up"
      style="
        background:#fff;border:1px solid #E2E8F0;border-radius:12px;
        overflow:hidden;box-shadow:0 1px 4px rgba(15,23,42,0.05);
      "
    >
      <!-- Table Header -->
      <div style="
        display:grid;grid-template-columns:2fr 1fr 1fr 1.2fr 1fr 1fr 80px;
        padding:12px 20px;
        background:#F8FAFC;border-bottom:1px solid #E2E8F0;
        font-size:11px;font-weight:700;color:#64748B;letter-spacing:0.08em;text-transform:uppercase;
      ">
        <div>Asset / Tag</div>
        <div>Type</div>
        <div>Status</div>
        <div>Assigned To</div>
        <div>Purchase Date</div>
        <div>Warranty</div>
        <div></div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredAssets.length === 0" style="text-align:center;padding:60px 20px;">
        <svg style="margin:0 auto 16px;display:block;opacity:0.3;" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        <p style="color:#94A3B8;font-size:14px;margin:0;">No assets match your filters.</p>
      </div>

      <!-- Asset Rows -->
      <div
        v-for="(asset, idx) in filteredAssets"
        :key="asset.id"
        :style="`
          display:grid;grid-template-columns:2fr 1fr 1fr 1.2fr 1fr 1fr 80px;
          padding:14px 20px;align-items:center;
          border-bottom:${idx < filteredAssets.length - 1 ? '1px solid #F1F5F9' : 'none'};
          transition:background 0.15s;cursor:default;
        `"
        @mouseover="($event.currentTarget as HTMLElement).style.background='#FAFBFF'"
        @mouseleave="($event.currentTarget as HTMLElement).style.background='transparent'"
      >
        <!-- Name + Tag -->
        <div style="display:flex;align-items:center;gap:12px;min-width:0;">
          <div :style="`
            width:36px;height:36px;border-radius:9px;flex-shrink:0;
            background:${typeColor(asset.type).bg};
            display:flex;align-items:center;justify-content:center;
          `">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" :stroke="typeColor(asset.type).stroke" stroke-width="2">
              <path :d="typeIcon(asset.type)"/>
            </svg>
          </div>
          <div style="min-width:0;">
            <div style="font-size:13px;font-weight:700;color:#0F172A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ asset.name }}</div>
            <div style="font-size:11px;color:#94A3B8;font-family:monospace;margin-top:2px;">{{ asset.assetTag }}</div>
          </div>
        </div>

        <!-- Type -->
        <div>
          <span :style="`
            font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px;
            color:${typeColor(asset.type).stroke};background:${typeColor(asset.type).bg};
          `">{{ asset.type }}</span>
        </div>

        <!-- Status -->
        <div>
          <span :style="`
            display:inline-flex;align-items:center;gap:5px;
            font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px;
            color:${statusStyle(asset.status).color};background:${statusStyle(asset.status).bg};
          `">
            <span :style="`width:6px;height:6px;border-radius:50%;background:${statusStyle(asset.status).dot};flex-shrink:0;`"></span>
            {{ asset.status }}
          </span>
        </div>

        <!-- Assigned To -->
        <div>
          <template v-if="asset.assignedToName">
            <div style="font-size:13px;font-weight:600;color:#334155;">{{ asset.assignedToName }}</div>
            <div v-if="asset.department" style="font-size:11px;color:#94A3B8;margin-top:2px;">{{ asset.department }}</div>
          </template>
          <span v-else style="font-size:13px;color:#CBD5E1;">Unassigned</span>
        </div>

        <!-- Purchase Date -->
        <div style="font-size:13px;color:#475569;">{{ formatDate(asset.purchaseDate) }}</div>

        <!-- Warranty -->
        <div>
          <template v-if="asset.warrantyExpiry">
            <div :style="`
              font-size:12px;font-weight:600;padding:3px 8px;border-radius:6px;display:inline-block;
              ${isWarrantyExpired(asset.warrantyExpiry) ? 'color:#EF4444;background:#FEF2F2;' :
                isWarrantyExpiringSoon(asset.warrantyExpiry) ? 'color:#D97706;background:#FFF7ED;' :
                'color:#10B981;background:#ECFDF5;'}
            `">
              {{ isWarrantyExpired(asset.warrantyExpiry) ? '⚠ Expired' : formatDate(asset.warrantyExpiry) }}
            </div>
          </template>
          <span v-else style="font-size:13px;color:#CBD5E1;">—</span>
        </div>

        <!-- Actions -->
        <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end;">
          <button
            style="
              width:30px;height:30px;border-radius:7px;border:1px solid #E2E8F0;
              background:#fff;color:#64748B;display:flex;align-items:center;justify-content:center;
              cursor:pointer;transition:all 0.15s;
            "
            title="Edit"
            @click="openEdit(asset)"
            @mouseover="($event.currentTarget as HTMLElement).style.background='#EEF2FF';($event.currentTarget as HTMLElement).style.color='#6366F1';($event.currentTarget as HTMLElement).style.borderColor='#C7D2FE'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background='#fff';($event.currentTarget as HTMLElement).style.color='#64748B';($event.currentTarget as HTMLElement).style.borderColor='#E2E8F0'"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            style="
              width:30px;height:30px;border-radius:7px;border:1px solid #E2E8F0;
              background:#fff;color:#64748B;display:flex;align-items:center;justify-content:center;
              cursor:pointer;transition:all 0.15s;
            "
            title="Delete"
            @click="handleDelete(asset.id)"
            @mouseover="($event.currentTarget as HTMLElement).style.background='#FEF2F2';($event.currentTarget as HTMLElement).style.color='#EF4444';($event.currentTarget as HTMLElement).style.borderColor='#FECACA'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background='#fff';($event.currentTarget as HTMLElement).style.color='#64748B';($event.currentTarget as HTMLElement).style.borderColor='#E2E8F0'"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Table Footer -->
      <div style="padding:12px 20px;background:#F8FAFC;border-top:1px solid #E2E8F0;font-size:12px;color:#64748B;">
        Showing <strong>{{ filteredAssets.length }}</strong> of <strong>{{ assetStore.assets.length }}</strong> assets
      </div>
    </div>

    <!-- ── Add / Edit SlideOver ──────────────────────────────── -->
    <SlideOver :show="showForm" :title="isEditing ? 'Edit Asset' : 'Add New Asset'" @close="showForm = false">
      <template #content>
        <div style="display:flex;flex-direction:column;gap:20px;">

          <!-- Name -->
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Asset Name</label>
            <input v-model="formData.name" type="text" placeholder="e.g. ThinkPad T14 Gen 3"
              style="width:100%;padding:10px 14px;font-size:14px;color:#0F172A;background:#fff;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;box-sizing:border-box;transition:all 0.15s;"
              @focus="onFocus" @blur="onBlur">
          </div>

          <!-- Tag + Serial (2 col) -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div>
              <label style="display:block;font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Asset Tag</label>
              <input v-model="formData.assetTag" type="text" placeholder="TC-LT-001"
                style="width:100%;padding:10px 14px;font-size:14px;font-family:monospace;color:#334155;background:#fff;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;box-sizing:border-box;transition:all 0.15s;"
                @focus="onFocus" @blur="onBlur">
            </div>
            <div>
              <label style="display:block;font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Serial Number</label>
              <input v-model="formData.serialNumber" type="text" placeholder="Optional"
                style="width:100%;padding:10px 14px;font-size:14px;font-family:monospace;color:#334155;background:#fff;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;box-sizing:border-box;transition:all 0.15s;"
                @focus="onFocus" @blur="onBlur">
            </div>
          </div>

          <!-- Type + Status (2 col) -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div>
              <label style="display:block;font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Type</label>
              <select v-model="formData.type"
                style="width:100%;padding:10px 14px;font-size:14px;color:#334155;background:#fff;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;box-sizing:border-box;cursor:pointer;"
                @focus="onFocus" @blur="onBlur">
                <option v-for="t in assetTypes.filter(x => x !== 'All')" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div>
              <label style="display:block;font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Status</label>
              <select v-model="formData.status"
                style="width:100%;padding:10px 14px;font-size:14px;color:#334155;background:#fff;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;box-sizing:border-box;cursor:pointer;"
                @focus="onFocus" @blur="onBlur">
                <option v-for="s in assetStatuses.filter(x => x !== 'All')" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>

          <!-- Assigned To + Dept -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div>
              <label style="display:block;font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Assigned To</label>
              <input v-model="formData.assignedToName" type="text" placeholder="Full name"
                style="width:100%;padding:10px 14px;font-size:14px;color:#334155;background:#fff;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;box-sizing:border-box;transition:all 0.15s;"
                @focus="onFocus" @blur="onBlur">
            </div>
            <div>
              <label style="display:block;font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Department</label>
              <input v-model="formData.department" type="text" placeholder="e.g. Engineering"
                style="width:100%;padding:10px 14px;font-size:14px;color:#334155;background:#fff;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;box-sizing:border-box;transition:all 0.15s;"
                @focus="onFocus" @blur="onBlur">
            </div>
          </div>

          <!-- Dates -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div>
              <label style="display:block;font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Purchase Date</label>
              <input v-model="formData.purchaseDate" type="date"
                style="width:100%;padding:10px 14px;font-size:14px;color:#334155;background:#fff;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;box-sizing:border-box;transition:all 0.15s;"
                @focus="onFocus" @blur="onBlur">
            </div>
            <div>
              <label style="display:block;font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Warranty Expiry</label>
              <input v-model="formData.warrantyExpiry" type="date"
                style="width:100%;padding:10px 14px;font-size:14px;color:#334155;background:#fff;border:1.5px solid #E2E8F0;border-radius:8px;outline:none;box-sizing:border-box;transition:all 0.15s;"
                @focus="onFocus" @blur="onBlur">
            </div>
          </div>

        </div>
      </template>

      <template #footer>
        <button
          type="button"
          style="padding:9px 20px;font-size:13px;font-weight:600;color:#475569;background:#fff;border:1.5px solid #E2E8F0;border-radius:8px;cursor:pointer;transition:all 0.15s;"
          @mouseover="($event.currentTarget as HTMLElement).style.background='#F8FAFC'"
          @mouseleave="($event.currentTarget as HTMLElement).style.background='#fff'"
          @click="showForm = false"
        >Cancel</button>
        <button
          type="button"
          style="
            padding:9px 20px;font-size:13px;font-weight:600;color:#fff;
            background:linear-gradient(135deg,#6366F1 0%,#4F46E5 100%);
            border:none;border-radius:8px;cursor:pointer;
            box-shadow:0 2px 8px rgba(99,102,241,0.35);transition:all 0.15s;
            display:inline-flex;align-items:center;gap:6px;
          "
          @mouseover="($event.currentTarget as HTMLElement).style.boxShadow='0 4px 16px rgba(99,102,241,0.45)';($event.currentTarget as HTMLElement).style.transform='translateY(-1px)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.boxShadow='0 2px 8px rgba(99,102,241,0.35)';($event.currentTarget as HTMLElement).style.transform='translateY(0)'"
          @click="handleSave"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {{ isEditing ? 'Save Changes' : 'Add Asset' }}
        </button>
      </template>
    </SlideOver>

  </div>
</template>

<style>
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
