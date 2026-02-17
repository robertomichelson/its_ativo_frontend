<template>
  <div class="att">

    <!-- status bar -->
    <header class="att-bar">
      <div class="att-bar__left">
        <span class="att-dot" :class="`att-dot--${store.status}`" />
        <span class="att-bar__status">{{ statusLabel }}</span>
        <span class="att-conn" :class="store.socketConnected ? 'att-conn--ok' : 'att-conn--err'">
          <q-icon :name="store.socketConnected ? 'wifi' : 'wifi_off'" size="11px" />
          {{ store.socketConnected ? 'conectado' : 'sem sinal' }}
        </span>
      </div>
      <span v-if="store.status !== 'waiting'" class="att-bar__timer">
        <q-icon name="timer" size="13px" style="opacity:.45" />
        {{ formattedTimer }}
      </span>
    </header>

    <!-- ── WAITING ────────────────────────────────────────────── -->
    <div v-if="store.status === 'waiting'" class="att-waiting">
      <MetricsDashboard />

      <div class="att-idle">
        <span class="att-spinner" />
        <p class="att-idle__text">Aguardando próximo cliente</p>
        <p class="att-idle__sub">Fique disponível — a ligação será conectada automaticamente.</p>
      </div>
    </div>

    <!-- ── ACTIVE ─────────────────────────────────────────────── -->
    <div v-else class="att-active">
      <AttendanceCard v-if="store.clientData" :client="store.clientData" />

      <div class="att-body">
        <!-- left -->
        <div class="att-body__main">
          <div class="att-card">
            <p class="att-card__label">Anotações</p>
            <q-input
              v-model="notes"
              type="textarea"
              placeholder="Registre observações sobre esta ligação..."
              outlined
              :rows="6"
              class="att-notes"
            />
          </div>

          <div class="att-card att-card--dim">
            <p class="att-card__label">
              Script / Histórico
              <span class="att-tag">em breve</span>
            </p>
            <p class="att-card__placeholder">
              Área reservada para script de vendas e histórico de compras do cliente.
            </p>
          </div>
        </div>

        <!-- right -->
        <div class="att-body__aside">
          <AttendanceTimer :seconds="store.timer" />

          <q-btn
            label="Novo Pedido"
            icon="shopping_cart"
            unelevated
            class="att-btn full-width"
            :disable="store.status === 'tabulating'"
            @click="showOrderDialog = true"
          />

          <div class="att-card">
            <p class="att-card__label">Finalizar atendimento</p>
            <AttendanceTabulationForm />
          </div>
        </div>
      </div>
    </div>

    <AttendanceOrderDialog v-model="showOrderDialog" />

    <div v-if="isDev" class="att-dev">
      <span>DEV</span>
      <q-btn dense size="sm" label="Simular" color="deep-purple" unelevated @click="simulateClient" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAttendanceStore } from '~/store/attendance'
import { useSocket } from '~/composables/useSocket'
import AttendanceTimer from '~/components/attendance/Timer.vue'
import AttendanceCard from '~/components/attendance/AttendanceCard.vue'
import AttendanceTabulationForm from '~/components/attendance/TabulationForm.vue'
import AttendanceOrderDialog from '~/components/attendance/OrderDialog.vue'
import MetricsDashboard from '~/components/attendance/MetricsDashboard.vue'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Atendimento Ativo | ITS Ativo' })

const store = useAttendanceStore()
const { connect, disconnect } = useSocket()
const showOrderDialog = ref(false)
const notes = ref('')
const isDev = process.env.NODE_ENV === 'development'

onMounted(() => connect())
onUnmounted(() => disconnect())

const statusLabel = computed(() => ({
  waiting:    'aguardando',
  active:     'em atendimento',
  tabulating: 'finalizando',
  checkout:   'checkout',
}[store.status] ?? store.status))

const formattedTimer = computed(() => {
  const s = store.timer
  const h = Math.floor(s / 3600).toString().padStart(2, '0')
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${h}:${m}:${sec}`
})

const simulateClient = async () => {
  await store.startAttendance('12345')
  if (!store.clientData) {
    store.clientData = {
      id: '12345', name: 'João da Silva Santos', cpf: '123.456.789-00',
      ddd: '11', phones: ['99999-9999', '8888-8888'],
      address: { street: 'Rua das Flores', number: '123', complement: 'Apto 4',
        neighborhood: 'Centro', city: 'São Paulo', state: 'SP', zipCode: '01001-000' },
    }
    store.status = 'active'
    store.startTimer()
  }
}
</script>

<style scoped>
/* ── Root ─────────────────────────────────────────────────────── */
.att {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  transition: background 0.3s ease, color 0.3s ease;
}

/* ── Status bar ───────────────────────────────────────────────── */
.att-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 1.25rem;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.att-bar__left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.att-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--muted);
  flex-shrink: 0;
}
.att-dot--active    { background: var(--green); animation: blink 2s ease infinite; }
.att-dot--tabulating { background: #f59e0b; }

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: .3; }
}

.att-bar__status {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--muted);
}

.att-conn {
  font-size: 0.62rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 20px;
}
.att-conn--ok  { color: var(--green);  background: color-mix(in srgb, var(--green) 12%, transparent); }
.att-conn--err { color: #ef4444; background: rgba(239,68,68,.1); }

.att-bar__timer {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.82rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
  color: var(--muted);
}

/* ── Waiting ──────────────────────────────────────────────────── */
.att-waiting {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem;
  gap: 2.5rem;
  max-width: 820px;
  margin: 0 auto;
  width: 100%;
}

.att-idle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

/* simple clean spinner */
.att-spinner {
  display: block;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  animation: spin 0.8s linear infinite;
  margin-bottom: 0.75rem;
}
@keyframes spin { to { transform: rotate(360deg); } }

.att-idle__text {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
  opacity: .7;
}
.att-idle__sub {
  font-size: 0.78rem;
  color: var(--muted);
  margin: 0;
  text-align: center;
}

/* ── Active ───────────────────────────────────────────────────── */
.att-active {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1rem 1.25rem 2rem;
  flex: 1;
}

.att-body {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 0.85rem;
  align-items: start;
}

.att-body__main,
.att-body__aside {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.att-body__aside {
  position: sticky;
  top: 56px;
}

/* ── Cards ────────────────────────────────────────────────────── */
.att-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.9rem 1rem;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.att-card--dim {
  background: var(--bg);
}

.att-card__label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0 0 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.att-card__placeholder {
  font-size: 0.8rem;
  color: var(--muted);
  margin: 0;
  text-align: center;
  padding: 1.25rem 0;
  opacity: .6;
}

.att-tag {
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  background: var(--border);
  color: var(--muted);
  padding: 2px 6px;
  border-radius: 4px;
}

/* notes */
.att-notes :deep(.q-field__control) { border-radius: 8px; }

/* primary btn */
.att-btn {
  background: var(--accent) !important;
  color: #fff !important;
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  border-radius: 8px !important;
  height: 40px;
  transition: opacity 0.15s ease;
}
.att-btn:hover:not(:disabled) { opacity: .88; }
.att-btn:disabled             { opacity: .35; }

/* dev */
.att-dev {
  position: fixed;
  bottom: 1rem; right: 1rem;
  z-index: 9999;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.4rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--muted);
}

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 800px) {
  .att-body { grid-template-columns: 1fr; }
  .att-body__aside { position: static; }
}
</style>
