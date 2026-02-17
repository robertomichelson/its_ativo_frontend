<template>
  <div class="tmr" :class="cls">
    <span class="tmr__label">tempo de atendimento</span>
    <span class="tmr__digits">{{ formatted }}</span>
    <div class="tmr__track"><div class="tmr__fill" :style="{ width: fill }" /></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ seconds: number }>()

const formatted = computed(() => {
  const h = Math.floor(props.seconds / 3600).toString().padStart(2, '0')
  const m = Math.floor((props.seconds % 3600) / 60).toString().padStart(2, '0')
  const s = (props.seconds % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
})

const cls = computed(() => {
  if (props.seconds > 600) return 'tmr--danger'
  if (props.seconds > 300) return 'tmr--warn'
  if (props.seconds > 0)   return 'tmr--ok'
  return ''
})

const fill = computed(() => `${Math.min((props.seconds / 600) * 100, 100)}%`)
</script>

<style scoped>
.tmr {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.1rem 1.25rem 0.9rem;
  text-align: center;
  transition: border-color 0.3s ease, background 0.3s ease;
}

.tmr__label {
  display: block;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 0.35rem;
}

.tmr__digits {
  display: block;
  font-size: 2.6rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  line-height: 1;
  color: var(--text);
  transition: color 0.3s ease;
}

.tmr__track {
  height: 2px;
  background: var(--border);
  border-radius: 1px;
  margin-top: 0.8rem;
  overflow: hidden;
}

.tmr__fill {
  height: 100%;
  border-radius: 1px;
  background: var(--muted);
  transition: width 1s linear, background 0.3s ease;
}

/* states */
.tmr--ok   { border-color: rgba(22, 163, 74, 0.3); }
.tmr--ok   .tmr__digits { color: var(--green); }
.tmr--ok   .tmr__fill   { background: var(--green); }

.tmr--warn { border-color: rgba(245, 158, 11, 0.35); }
.tmr--warn .tmr__digits { color: #f59e0b; }
.tmr--warn .tmr__fill   { background: #f59e0b; }

.tmr--danger { border-color: rgba(239, 68, 68, 0.4); animation: danger-pulse 1.4s ease-in-out infinite; }
.tmr--danger .tmr__digits { color: #ef4444; }
.tmr--danger .tmr__fill   { background: #ef4444; }

@keyframes danger-pulse {
  0%, 100% { border-color: rgba(239, 68, 68, 0.2); }
  50%       { border-color: rgba(239, 68, 68, 0.6); }
}
</style>
