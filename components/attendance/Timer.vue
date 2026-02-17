<template>
  <div class="timer-container row items-center justify-center q-pa-sm bg-grey-2 rounded-borders">
    <q-icon name="timer" size="sm" class="q-mr-sm" :color="timerColor" />
    <span class="text-h5 text-weight-bold" :class="timerClass">{{ formattedTime }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  seconds: number
}>()

const formattedTime = computed(() => {
  const h = Math.floor(props.seconds / 3600).toString().padStart(2, '0')
  const m = Math.floor((props.seconds % 3600) / 60).toString().padStart(2, '0')
  const s = (props.seconds % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
})

const timerColor = computed(() => {
    if (props.seconds > 600) return 'negative' // Red if over 10 mins
    if (props.seconds > 300) return 'warning' // Orange if over 5 mins
    return 'primary'
})

const timerClass = computed(() => {
    return `text-${timerColor.value}`
})
</script>

<style scoped>
.timer-container {
    border: 1px solid #ddd;
    display: inline-flex;
}
</style>
