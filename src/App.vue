<template>
  <div v-if="!authStore.isInitialized" class="loading-screen">
    <!-- пустой экран или спиннер -->
  </div>
  <router-view v-else />
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
</script>