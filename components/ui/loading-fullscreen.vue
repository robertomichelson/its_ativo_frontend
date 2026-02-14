<template>
  <div class="loading-screen">
    <div class="spinner" />
  </div>
</template>

<style>
.loading-screen {
  background: #f8f9fa;
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner {
  border: 3px solid #e5e7eb;
  border-top: 3px solid #07AE86;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
