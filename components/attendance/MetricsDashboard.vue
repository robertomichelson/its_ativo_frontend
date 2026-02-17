<template>
  <div class="mdb">
    <template v-if="metrics">
      <div v-for="(row, key) in rows" :key="key" class="mdb__row">
        <span class="mdb__period">{{ row.label }}</span>
        <div class="mdb__stats">
          <div v-for="stat in row.stats" :key="stat.name" class="mdb__stat">
            <q-icon :name="stat.icon" size="16px" class="mdb__icon" :style="{ color: stat.color }" />
            <span class="mdb__value">{{ stat.value }}</span>
            <span class="mdb__name">{{ stat.name }}</span>
          </div>
        </div>
      </div>
    </template>

    <div v-else-if="loading" class="mdb__empty">
      <q-spinner size="xs" color="grey" /> Carregando métricas...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { attendanceService, type UserMetrics } from '~/services/attendance.service'

const metrics = ref<UserMetrics | null>(null)
const loading = ref(true)

onMounted(async () => {
  try { metrics.value = await attendanceService.getMetrics() }
  catch { /* silencioso */ }
  finally { loading.value = false }
})

const rows = computed(() => {
  if (!metrics.value) return {}
  return {
    daily: {
      label: 'hoje',
      stats: [
        { name: 'ligações',  value: metrics.value.daily.calls,                icon: 'call',          color: '#3b82f6' },
        { name: 'vendas',    value: metrics.value.daily.sales,                icon: 'shopping_cart', color: '#16a34a' },
        { name: 'conversão', value: `${metrics.value.daily.conversionRate}%`, icon: 'trending_up',   color: '#9333ea' },
        { name: 't. médio',  value: metrics.value.daily.averageTime,          icon: 'schedule',      color: '#f59e0b' },
      ],
    },
    monthly: {
      label: 'mês atual',
      stats: [
        { name: 'ligações',  value: metrics.value.monthly.calls,                icon: 'call',          color: '#3b82f6' },
        { name: 'vendas',    value: metrics.value.monthly.sales,                icon: 'shopping_cart', color: '#16a34a' },
        { name: 'conversão', value: `${metrics.value.monthly.conversionRate}%`, icon: 'trending_up',   color: '#9333ea' },
        { name: 't. médio',  value: metrics.value.monthly.averageTime,          icon: 'schedule',      color: '#f59e0b' },
      ],
    },
  }
})
</script>

<style scoped>
.mdb {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.mdb__row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 1.4rem;
}

.mdb__row + .mdb__row {
  border-top: 1px solid var(--border);
}

.mdb__period {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  min-width: 64px;
  flex-shrink: 0;
}

.mdb__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  flex: 1;
}

.mdb__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 1rem;
  border-left: 1px solid var(--border);
}
.mdb__stat:first-child { border-left: none; padding-left: 0; }

.mdb__icon {
  margin-bottom: 2px;
}

.mdb__value {
  font-size: 1.5rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--text);
  letter-spacing: -0.01em;
}

.mdb__name {
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

.mdb__empty {
  padding: 1.25rem 1.4rem;
  font-size: 0.8rem;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 560px) {
  .mdb__row { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
  .mdb__stats { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
  .mdb__stat { border-left: none; padding: 0; }
}
</style>
