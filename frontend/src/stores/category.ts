import { defineStore } from 'pinia'
import { ref } from 'vue'
import { CategoryService } from '../services/OtherServices'
import type { Category } from '../types/Category'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])
  const isLoading = ref(false)

  async function fetchCategories() {
    isLoading.value = true
    try {
      categories.value = await CategoryService.getAll()
    } finally {
      isLoading.value = false
    }
  }

  async function createCategory(data: Partial<Category>) {
    const newCat = await CategoryService.create(data)
    categories.value.push(newCat)
    return newCat
  }

  async function updateCategory(id: string, updates: Partial<Category>) {
    const updated = await CategoryService.update(id, updates)
    const index = categories.value.findIndex(c => c.id === id)
    if (index !== -1) {
      categories.value[index] = updated
    }
    return updated
  }

  async function deleteCategory(id: string) {
    await CategoryService.delete(id)
    categories.value = categories.value.filter(c => c.id !== id)
  }

  return { categories, isLoading, fetchCategories, createCategory, updateCategory, deleteCategory }
})
