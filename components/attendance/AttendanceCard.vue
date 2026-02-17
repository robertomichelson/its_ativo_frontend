<template>
  <div class="q-pa-md row items-start q-gutter-md">
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6">Dados do Cliente</div>
        <div class="text-subtitle2">{{ client.name }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-6">
                <q-item>
                    <q-item-section avatar>
                        <q-icon name="person" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label caption>Nome</q-item-label>
                        <q-item-label>{{ client.name }}</q-item-label>
                    </q-item-section>
                </q-item>
            </div>
             <div class="col-12 col-md-6">
                <q-item>
                    <q-item-section avatar>
                        <q-icon name="badge" color="primary" />
                    </q-item-section>
                     <q-item-section>
                        <q-item-label caption>CPF</q-item-label>
                        <q-item-label>{{ client.cpf }}</q-item-label>
                    </q-item-section>
                </q-item>
            </div>
             <div class="col-12 col-md-6">
                <q-item>
                    <q-item-section avatar>
                        <q-icon name="phone" color="primary" />
                    </q-item-section>
                     <q-item-section>
                        <q-item-label caption>Telefones</q-item-label>
                        <q-item-label>{{ client.phones.join(', ') }}</q-item-label>
                    </q-item-section>
                </q-item>
            </div>
             <div class="col-12 col-md-6">
                <q-item>
                    <q-item-section avatar>
                        <q-icon name="location_on" color="primary" />
                    </q-item-section>
                     <q-item-section>
                        <q-item-label caption>Endereço</q-item-label>
                        <q-item-label v-if="client.address">
                            {{ client.address.street }}, {{ client.address.number }} - {{ client.address.neighborhood }}
                            <br>
                            {{ client.address.city }} - {{ client.address.state }}
                        </q-item-label>
                        <q-item-label v-else>Endereço não informado</q-item-label>
                    </q-item-section>
                </q-item>
            </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import type { ClientData } from '~/services/attendance.service';

defineProps<{
  client: ClientData
}>()
</script>

<style scoped>
.my-card {
  width: 100%;
  max-width: 800px;
}
</style>
