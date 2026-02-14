<template>
  <div class="app-layout">
    <MainSidebar />

    <main class="main-content" :class="{ expanded: isCollapsed }">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, provide } from 'vue'
import MainSidebar from '~/components/layout/MainSidebar.vue'

const hover = ref(false)
const isMobile = ref(false)
const isOpen = ref(false)

const isCollapsed = computed(() => {
  return isMobile.value ? false : !hover.value
})

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 769
  if (!isMobile.value) isOpen.value = false
}

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

provide('sidebarState', {
  hover,
  isMobile,
  isCollapsed,
  isOpen,
  toggleMenu,
})

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<style scoped>
.app-layout {
  height: 100vh;
  background-color: #f8f9fa;
  display: flex;
}

.main-content {
  margin-left: 240px;
  width: calc(100% - 240px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100vh;
  overflow-y: auto;
}

.main-content.expanded {
  margin-left: 72px;
  width: calc(100% - 72px);
}

@media (max-width: 768px) {
  .main-content,
  .main-content.expanded {
    margin-left: 0 !important;
    width: 100% !important;
  }
}
</style>
