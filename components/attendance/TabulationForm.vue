<template>
  <q-form @submit="onSubmit" class="tab">
    <q-select
      v-model="selectedTabulation"
      :options="tabulationOptions"
      option-label="label"
      option-value="id"
      label="Tabulação"
      outlined
      dense
      class="tab__field"
      :rules="[val => !!val || 'Obrigatório']"
    />

    <q-input
      v-model="observation"
      type="textarea"
      label="Observações"
      outlined
      dense
      class="tab__field"
      :rows="3"
    />

    <q-btn
      label="Finalizar atendimento"
      icon="check_circle_outline"
      type="submit"
      unelevated
      :loading="loading"
      class="full-width tab__submit"
    />
  </q-form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { attendanceService, type TabulationOption } from '~/services/attendance.service'
import { useAttendanceStore } from '~/store/attendance'
import { useQuasar } from 'quasar'

const store = useAttendanceStore()
const $q = useQuasar()
const tabulationOptions = ref<TabulationOption[]>([])
const selectedTabulation = ref<TabulationOption | null>(null)
const observation = ref('')
const loading = ref(false)

onMounted(async () => {
  try { tabulationOptions.value = await attendanceService.getTabulationOptions() }
  catch { $q.notify({ type: 'negative', message: 'Erro ao carregar tabulações' }) }
})

const onSubmit = async () => {
  if (!selectedTabulation.value || !store.clientData) return
  loading.value = true
  try {
    await attendanceService.submitTabulation({
      idclicamptel: store.currentIdClicamptel!,
      tabulationId: selectedTabulation.value.id,
      observation: observation.value,
    })
    $q.notify({ type: 'positive', message: 'Tabulação salva!' })
    store.resetState()
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar tabulação' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.tab {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.tab__field :deep(.q-field__control) { border-radius: 8px; }

.tab__submit {
  background: var(--accent) !important;
  color: #fff !important;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  border-radius: 8px !important;
  height: 38px;
  margin-top: 0.15rem;
  transition: opacity 0.15s ease;
}
.tab__submit:hover { opacity: .88; }
</style>
