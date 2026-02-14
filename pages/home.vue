<template>
  <StandardPage title="Bem-vindo">
    <div class="home-content">
      <p>Home.</p>
    </div>
  </StandardPage>
</template>

<script setup lang="ts">
import StandardPage from '~/components/ui/StandardPage.vue'

useHead({
  title: 'Home | ITS Ativo',
})

definePageMeta({
  middleware: 'auth',
})
</script>

<style scoped>
.home-content {
  padding-top: 0.5rem;
}
</style>
