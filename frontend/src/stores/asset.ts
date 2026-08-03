import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AssetService } from '../services/AssetService'
import type { Asset } from '../types/Asset'

export const useAssetStore = defineStore('asset', () => {
  const assets = ref<Asset[]>([])
  const isLoading = ref(false)

  async function fetchAssets() {
    isLoading.value = true
    try {
      assets.value = await AssetService.getAll()
    } finally {
      isLoading.value = false
    }
  }

  async function createAsset(data: Partial<Asset>) {
    const newAsset = await AssetService.create(data)
    assets.value.push(newAsset)
    return newAsset
  }

  async function updateAsset(id: string, updates: Partial<Asset>) {
    const updated = await AssetService.update(id, updates)
    const index = assets.value.findIndex(a => a.id === id)
    if (index !== -1) {
      assets.value[index] = updated
    }
    return updated
  }

  async function deleteAsset(id: string) {
    await AssetService.delete(id)
    assets.value = assets.value.filter(a => a.id !== id)
  }

  return { assets, isLoading, fetchAssets, createAsset, updateAsset, deleteAsset }
})
