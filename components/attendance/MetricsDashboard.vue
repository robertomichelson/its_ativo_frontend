<template>
  <div class="q-pa-md">
    <div class="text-h6 q-mb-md text-primary">Suas Métricas</div>
    
    <div class="row q-col-gutter-md">
      <!-- Daily Metrics -->
      <div class="col-12 col-md-6">
        <q-card class="bg-blue-1">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-blue-9">Hoje</div>
          </q-card-section>
          <q-separator inset />
          <q-card-section class="row q-col-gutter-sm">
             <div class="col-6">
               <q-item>
                 <q-item-section avatar>
                   <q-icon name="call" color="blue" />
                 </q-item-section>
                 <q-item-section>
                   <q-item-label caption>Atendimentos</q-item-label>
                   <q-item-label class="text-h6">{{ metrics?.daily.calls || 0 }}</q-item-label>
                 </q-item-section>
               </q-item>
             </div>
             <div class="col-6">
               <q-item>
                 <q-item-section avatar>
                   <q-icon name="shopping_cart" color="green" />
                 </q-item-section>
                 <q-item-section>
                   <q-item-label caption>Vendas</q-item-label>
                   <q-item-label class="text-h6">{{ metrics?.daily.sales || 0 }}</q-item-label>
                 </q-item-section>
               </q-item>
             </div>
             <div class="col-6">
               <q-item>
                 <q-item-section avatar>
                   <q-icon name="trending_up" color="purple" />
                 </q-item-section>
                 <q-item-section>
                   <q-item-label caption>Conversão</q-item-label>
                   <q-item-label class="text-h6">{{ metrics?.daily.conversionRate || 0 }}%</q-item-label>
                 </q-item-section>
               </q-item>
             </div>
              <div class="col-6">
               <q-item>
                 <q-item-section avatar>
                   <q-icon name="schedule" color="orange" />
                 </q-item-section>
                 <q-item-section>
                   <q-item-label caption>T. Médio</q-item-label>
                   <q-item-label class="text-subtitle1">{{ metrics?.daily.averageTime || '--' }}</q-item-label>
                 </q-item-section>
               </q-item>
             </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Monthly Metrics -->
      <div class="col-12 col-md-6">
        <q-card class="bg-grey-1">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-grey-9">Mês Atual</div>
          </q-card-section>
          <q-separator inset />
          <q-card-section class="row q-col-gutter-sm">
             <div class="col-6">
               <q-item>
                 <q-item-section avatar>
                   <q-icon name="call" color="grey-7" />
                 </q-item-section>
                 <q-item-section>
                   <q-item-label caption>Atendimentos</q-item-label>
                   <q-item-label class="text-h6">{{ metrics?.monthly.calls || 0 }}</q-item-label>
                 </q-item-section>
               </q-item>
             </div>
             <div class="col-6">
               <q-item>
                 <q-item-section avatar>
                   <q-icon name="shopping_cart" color="grey-7" />
                 </q-item-section>
                 <q-item-section>
                   <q-item-label caption>Vendas</q-item-label>
                   <q-item-label class="text-h6">{{ metrics?.monthly.sales || 0 }}</q-item-label>
                 </q-item-section>
               </q-item>
             </div>
             <div class="col-6">
               <q-item>
                 <q-item-section avatar>
                   <q-icon name="trending_up" color="grey-7" />
                 </q-item-section>
                 <q-item-section>
                   <q-item-label caption>Conversão</q-item-label>
                   <q-item-label class="text-h6">{{ metrics?.monthly.conversionRate || 0 }}%</q-item-label>
                 </q-item-section>
               </q-item>
             </div>
              <div class="col-6">
               <q-item>
                 <q-item-section avatar>
                   <q-icon name="schedule" color="grey-7" />
                 </q-item-section>
                 <q-item-section>
                   <q-item-label caption>T. Médio</q-item-label>
                   <q-item-label class="text-subtitle1">{{ metrics?.monthly.averageTime || '--' }}</q-item-label>
                 </q-item-section>
               </q-item>
             </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { attendanceService, type UserMetrics } from '~/services/attendance.service'

const metrics = ref<UserMetrics | null>(null)

onMounted(async () => {
    try {
        metrics.value = await attendanceService.getMetrics()
    } catch (e) {
        console.error('Failed to load metrics', e)
    }
})
</script>
