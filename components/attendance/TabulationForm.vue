<template>
  <div class="q-pa-sm">
     <q-form @submit="onSubmit" class="q-gutter-sm">
        <q-select
          v-model="selectedTabulation"
          :options="tabulationOptions"
          option-label="label"
          option-value="id"
          label="Selecione a Tabulação"
          filled
          dense
          :rules="[val => !!val || 'Campo obrigatório']"
        />

        <q-input
          v-model="observation"
          type="textarea"
          label="Observações"
          filled
          dense
          rows="3"
        />

        <div class="row justify-end q-mt-sm">
           <q-btn label="Salvar Tabulação" type="submit" color="primary" :loading="loading" class="full-width" />
        </div>
      </q-form>
  </div>
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
    try {
        tabulationOptions.value = await attendanceService.getTabulationOptions()
    } catch (e) {
        $q.notify({
            type: 'negative',
            message: 'Erro ao carregar opções de tabulação'
        })
    }
})

const onSubmit = async () => {
    if (!selectedTabulation.value || !store.clientData) return

    loading.value = true
    try {
        await attendanceService.submitTabulation({
            idclicamptel: store.currentIdClicamptel!, 
            tabulationId: selectedTabulation.value.id,
            observation: observation.value
        })
        $q.notify({
            type: 'positive',
            message: 'Tabulação salva com sucesso!'
        })
        store.resetState()
    } catch (e) {
        $q.notify({
            type: 'negative',
            message: 'Erro ao salvar tabulação'
        })
    } finally {
        loading.value = false
    }
}
</script>
