<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Pagina nao encontrada</p>
    <q-btn label="Voltar ao inicio" color="primary" to="/home" />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '404 | ITS Ativo',
})

definePageMeta({
  layout: false,
})
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.not-found h1 {
  font-size: 4rem;
  font-weight: bold;
  color: #1a1a2e;
}

.not-found p {
  color: #6b7280;
  font-size: 1.2rem;
}
</style>
