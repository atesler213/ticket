<script setup lang="ts">
import { X } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  title: string
  subtitle?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="slideover">
      <div
        v-if="show"
        style="
          position: fixed;
          top: 0; right: 0; bottom: 0; left: 0;
          z-index: 9999;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
        "
        @click.self="emit('close')"
      >
        <div
          style="
            width: 560px;
            max-width: 92vw;
            height: auto;
            max-height: 90vh;
            border-radius: 16px;
            background: #ffffff;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            animation: modalPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          "
        >
          <!-- Header -->
          <div style="
            padding: 20px 24px;
            border-bottom: 1px solid #F1F5F9;
            background: linear-gradient(180deg, #fff 0%, #F8FAFC 100%);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
          ">
            <div>
              <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 2px 0; line-height: 1.3;">
                {{ title }}
              </h2>
              <p v-if="subtitle" style="font-size: 12px; color: #94A3B8; margin: 0;">{{ subtitle }}</p>
            </div>
            <button
              type="button"
              style="
                width: 32px; height: 32px;
                border-radius: 8px;
                border: 1px solid #E2E8F0;
                background: #fff;
                color: #64748B;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer;
                transition: all 0.15s;
              "
              @click="emit('close')"
              @mouseover="($event.target as HTMLElement).closest('button')!.style.background = '#F1F5F9'"
              @mouseleave="($event.target as HTMLElement).closest('button')!.style.background = '#fff'"
            >
              <X :size="16" />
            </button>
          </div>

          <!-- Body -->
          <div style="flex: 1; padding: 24px; overflow-y: auto;">
            <slot name="content"></slot>
            <slot></slot>
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            style="
              flex-shrink: 0;
              padding: 16px 24px;
              border-top: 1px solid #F1F5F9;
              background: linear-gradient(180deg, #F8FAFC 0%, #fff 100%);
              display: flex;
              justify-content: flex-end;
              gap: 12px;
            "
          >
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@keyframes modalPopIn {
  0% { transform: scale(0.92) translateY(12px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

.slideover-enter-active,
.slideover-leave-active {
  transition: opacity 0.2s ease;
}
.slideover-enter-from,
.slideover-leave-to {
  opacity: 0;
}
</style>
