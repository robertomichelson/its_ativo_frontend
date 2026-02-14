<template>
  <div class="standard-page-container">
    <div class="page-header">
      <h1 class="page-title">{{ title }}</h1>

      <div v-if="subtitle" class="page-subtitle">
        <span>{{ subtitle }}</span>
      </div>

      <div v-if="$slots.header" class="header-content">
        <slot name="header" />
      </div>
    </div>

    <div class="page-content">
      <slot />
    </div>

    <div v-if="$slots.actions" class="page-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
}

defineProps<Props>()
</script>

<style scoped>
.standard-page-container {
  padding: 0 2rem 2rem 2rem;
}

.page-header {
  padding: 0;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.page-subtitle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
  margin: 4px 0 16px 0;
}

.header-content {
  margin-top: 16px;
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 24px;
}

.page-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  padding: 20px 0;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .standard-page-container {
    padding: 0 1rem 1rem 1rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .page-actions {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
