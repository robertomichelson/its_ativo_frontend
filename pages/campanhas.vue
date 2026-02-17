<template>
  <StandardPage title="Campanhas">
    <q-card>
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey"
        active-color="deep-orange"
        indicator-color="deep-orange"
        align="justify"
      >
        <q-tab name="grupos" label="Grupos de Campanhas" />
        <q-tab name="campanhas" label="Campanhas" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel name="grupos" class="q-pa-none">
          <div class="q-pa-md">
            <GruposCampanhasTable />
          </div>
        </q-tab-panel>

        <q-tab-panel name="campanhas" class="q-pa-none">
          <div class="q-pa-md">
            <CampanhasTable />
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </StandardPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StandardPage from '~/components/ui/StandardPage.vue'
import GruposCampanhasTable from '~/components/campanhas/grupos-campanhas-table.vue'
import CampanhasTable from '~/components/campanhas/campanhas-table.vue'

const activeTab = ref('grupos')

useHead({
  title: 'Campanhas | ITS Ativo',
})

definePageMeta({
  middleware: 'auth',
})
</script>
