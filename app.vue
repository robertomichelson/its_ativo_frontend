<template>
  <div>
    <Toaster position="top-right" richColors />
    <LoadingFullscreen v-if="!authReady" />
    <template v-else>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import LoadingFullscreen from '~/components/ui/loading-fullscreen.vue'
import { useAuthStore } from '~/store/auth'

const auth = useAuthStore()

const authReady = computed(() => auth.ready)

onMounted(async () => {
  if (!auth.ready) {
    await auth.restoreSession()
  }
})
</script>
