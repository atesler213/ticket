<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCategoryStore } from '../../stores/category'
import SlideOver from '../../components/admin/SlideOver.vue'
import type { Category } from '../../types/Category'

const categoryStore = useCategoryStore()

onMounted(async () => {
  await categoryStore.fetchCategories()
})

const showForm = ref(false)
const isEditing = ref(false)
const currentId = ref('')

const formData = ref<Partial<Category>>({
  name: '',
  description: ''
})

function openCreate() {
  isEditing.value = false
  currentId.value = ''
  formData.value = { name: '', description: '' }
  showForm.value = true
}

function openEdit(cat: Category) {
  isEditing.value = true
  currentId.value = cat.id
  formData.value = { ...cat }
  showForm.value = true
}

async function handleSave() {
  if (isEditing.value) {
    await categoryStore.updateCategory(currentId.value, formData.value)
  } else {
    await categoryStore.createCategory(formData.value)
  }
  showForm.value = false
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6 animate-slide-up">
      <p class="text-sm text-gray-500">Define categories and subcategories used for ticket routing.</p>
      <button class="btn btn-primary btn-sm" @click="openCreate">Add Category</button>
    </div>

    <div class="card card-no-hover animate-slide-up">
      <div class="card-body p-0">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-5 py-3 font-medium text-gray-500">Category</th>
              <th class="px-5 py-3 font-medium text-gray-500">Subcategories</th>
              <th class="px-5 py-3 font-medium text-gray-500">Default Assignee Group</th>
              <th class="px-5 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="categoryStore.isLoading">
              <td colspan="4" class="text-center py-8 text-gray-400">Loading...</td>
            </tr>
            <tr v-else-if="categoryStore.categories.length === 0">
              <td colspan="4" class="text-center py-8 text-gray-400">No categories found.</td>
            </tr>
            <tr v-else v-for="cat in categoryStore.categories" :key="cat.id">
              <td class="px-5 py-4 font-medium text-gray-900">{{ cat.name }}</td>
              <td class="px-5 py-4 text-gray-500">{{ cat.description || 'â€”' }}</td>
              <td class="px-5 py-4">
                <span class="badge" style="background:#F1F5F9;color:#475569;">General Support Team</span>
              </td>
              <td class="px-5 py-4 text-right">
                <button @click="openEdit(cat)" class="text-blue-600 hover:text-blue-800">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <SlideOver :show="showForm" :title="isEditing ? 'Edit Category' : 'Add New Category'" @close="showForm = false">
      <template #content>
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input type="text" v-model="formData.name" class="form-input w-full">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea v-model="formData.description" class="form-input w-full" rows="3"></textarea>
          </div>
        </div>
      </template>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="showForm = false">Cancel</button>
        <button type="button" class="btn btn-primary" @click="handleSave">Save</button>
      </template>
    </SlideOver>
  </div>
</template>
