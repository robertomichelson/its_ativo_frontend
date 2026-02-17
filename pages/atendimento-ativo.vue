<template>
  <div class="q-pa-md flex flex-center column q-gutter-md">
    <div class="text-h4 text-primary">Atendimento Ativo</div>

    <!-- Status: Waiting -->
    <div v-if="store.status === 'waiting'" class="full-width text-center" style="max-width: 1200px;">
       <metrics-dashboard />
       <div class="q-pa-lg">
          <q-spinner-dots color="primary" size="3em" />
          <div class="text-h6 q-mt-md">Aguardando Próximo Cliente...</div>
          <div class="text-caption text-grey">Conectado ao socket: {{ store.socketConnected ? 'Sim' : 'Não' }}</div>
       </div>
    </div>

    <!-- Status: Active / Tabulating / Checkout -->
    <div v-else class="full-width row q-col-gutter-md" style="max-width: 1400px;">
      
      <!-- LEFT COLUMN: Client Info & Context -->
      <div class="col-12 col-md-9 q-gutter-md">
          <!-- Client Data -->
          <attendance-card v-if="store.clientData" :client="store.clientData" />
          
          <!-- History or Script could go here -->
          <q-card class="bg-grey-1" flat bordered>
              <q-card-section>
                  <div class="text-subtitle2 text-grey-7">Histórico / Script de Vendas (Placeholder)</div>
                  <div class="q-pa-md text-center text-grey-5">
                      Área reservada para histórico de compras ou script de atendimento.
                  </div>
              </q-card-section>
          </q-card>
      </div>

       <!-- RIGHT COLUMN: Controls & Tabulation -->
      <div class="col-12 col-md-3 q-gutter-md">
          
          <!-- Timer & Actions -->
          <q-card bordered flat>
              <q-card-section class="column items-center q-gutter-sm">
                  <div class="text-caption text-grey">Tempo de Atendimento</div>
                  <attendance-timer :seconds="store.timer" />
                  
                  <q-separator class="full-width q-my-sm" />
                  
                  <q-btn 
                    label="Novo Pedido" 
                    color="secondary" 
                    icon="shopping_cart" 
                    class="full-width"
                    @click="showOrderDialog = true"
                    :disable="store.status === 'tabulating'"
                />
              </q-card-section>
          </q-card>

          <!-- Embedded Tabulation -->
          <q-card bordered flat class="bg-blue-grey-1">
             <q-card-section>
                  <div class="text-subtitle2 text-blue-grey-9 text-weight-bold">Finalizar (Tabulação)</div>
             </q-card-section>
             <q-separator />
             <q-card-section class="q-pa-none">
                 <attendance-tabulation-form />
             </q-card-section>
          </q-card>

      </div>
    
    </div>

    <!-- Order Dialog -->
    <attendance-order-dialog v-model="showOrderDialog" />
    
    <!-- Dev Tools for Testing -->
    <div v-if="isDev" class="fixed-bottom-right q-ma-md bg-grey-3 q-pa-sm rounded-borders" style="z-index: 9999;">
        <div class="text-caption text-weight-bold">Dev Tools</div>
        <q-btn dense size="sm" label="Simular Cliente" @click="simulateClient" color="purple" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAttendanceStore } from '~/store/attendance'
import { useSocket } from '~/composables/useSocket'
import AttendanceTimer from '~/components/attendance/Timer.vue'
import AttendanceCard from '~/components/attendance/AttendanceCard.vue'
import AttendanceTabulationForm from '~/components/attendance/TabulationForm.vue'
import AttendanceOrderDialog from '~/components/attendance/OrderDialog.vue'
import MetricsDashboard from '~/components/attendance/MetricsDashboard.vue'

// Explicitly register components if needed, or rely on Nuxt auto-import
// Nuxt auto-imports usually handle '~/components/...' if structured correctly, 
// but referencing them in template via kebab-case is standard.

const store = useAttendanceStore()
const { connect, disconnect } = useSocket()
const showOrderDialog = ref(false)

const isDev = 'development' // process.env.NODE_ENV === 'development'

onMounted(() => {
    connect()
})

onUnmounted(() => {
    disconnect()
})

const simulateClient = async () => {
    // Simulate socket event
    // The store action is async. If the API fails (e.g. backend down), it resets state.
    // So we await it, and if clientData is still null, we force mock data for dev testing.
    await store.startAttendance('12345')
    
    // Build some mock data if service fails in dev
    if (!store.clientData) {
        store.clientData = {
            id: '12345',
            name: 'Cliente Teste Dev',
            cpf: '123.456.789-00',
            ddd: '11',
            phones: ['99999-9999', '8888-8888'],
            address: {
                street: 'Rua das Flores',
                number: '123',
                neighborhood: 'Centro',
                city: 'São Paulo',
                state: 'SP',
                zipCode: '01001-000'
            }
        }
        store.status = 'active'
        store.startTimer()
    }
}
</script>
