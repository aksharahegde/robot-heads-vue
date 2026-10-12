<script setup lang="ts">
import type { Theme } from '../composables';

defineProps<{ theme: Theme }>();
defineEmits<{ toggle: [] }>();
</script>

<template>
  <button class="theme" :aria-label="theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'" :title="theme === 'light' ? 'Dark mode' : 'Light mode'" @click="$emit('toggle')">
    <svg v-if="theme === 'light'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
    </svg>
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </svg>
  </button>
</template>
