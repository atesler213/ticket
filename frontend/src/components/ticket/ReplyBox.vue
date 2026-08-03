<script setup lang="ts">
import { ref } from 'vue'
import { Paperclip, Send } from 'lucide-vue-next'

const props = defineProps<{
  allowInternalNotes?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', content: string, isInternal: boolean): void
}>()

const content = ref('')
const isSubmitting = ref(false)
const isInternalNote = ref(false)

function handleSubmit() {
  if (!content.value.trim()) return
  isSubmitting.value = true
  
  // Simulate delay for realism
  setTimeout(() => {
    emit('submit', content.value, isInternalNote.value)
    content.value = ''
    isSubmitting.value = false
  }, 400)
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-6" :class="{ 'ring-2 ring-yellow-400 border-transparent': isInternalNote }">
    <div class="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
      <div class="flex gap-2">
        <button class="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors" title="Attach file">
          <Paperclip :size="18" />
        </button>
      </div>
      <div v-if="props.allowInternalNotes" class="flex items-center gap-4 text-sm font-medium">
        <button 
          @click="isInternalNote = false"
          :class="!isInternalNote ? 'text-gray-900 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'"
          class="pb-1"
        >Public Reply</button>
        <button 
          @click="isInternalNote = true"
          :class="isInternalNote ? 'text-gray-900 border-b-2 border-yellow-500' : 'text-gray-500 hover:text-gray-700'"
          class="pb-1"
        >Internal Note</button>
      </div>
    </div>
    <div class="p-4">
      <textarea 
        v-model="content"
        rows="4" 
        class="w-full text-sm border-0 focus:ring-0 resize-none p-0" 
        placeholder="Type your reply here..."
      ></textarea>
    </div>
    <div class="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end" :class="{ 'bg-yellow-50 border-yellow-200': isInternalNote }">
      <button 
        @click="handleSubmit" 
        class="btn h-9 px-4 text-sm"
        :class="isInternalNote ? 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent' : 'btn-primary'"
        :disabled="isSubmitting || !content.trim()"
      >
        <Send :size="16" class="mr-2" />
        {{ isSubmitting ? 'Sending...' : (isInternalNote ? 'Add Note' : 'Reply') }}
      </button>
    </div>
  </div>
</template>
