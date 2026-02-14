<script setup>
await navigateTo('/home', { replace: true })

definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <div></div>
</template>
