<script setup lang="ts">
import { computed } from 'vue';
import { ROW_LABELS, SWATCHES, type Colors } from '../constants';

const props = defineProps<{ name: keyof Colors; value: string }>();
defineEmits<{ change: [value: string] }>();
const known = computed(() => SWATCHES[props.name].find(([, hex]) => hex === props.value));
</script>

<template>
  <div class="control">
    <div class="control-head">
      <span class="control-label">{{ ROW_LABELS[name] }}</span>
      <span class="control-value">{{ known ? known[0] : value }}</span>
    </div>
    <div class="swatches">
      <button
        v-for="[label, hex] in SWATCHES[name]"
        :key="hex"
        class="swatch"
        :style="{ background: hex }"
        :title="label"
        :aria-label="`${ROW_LABELS[name]}: ${label}`"
        :aria-pressed="hex === value"
        @click="$emit('change', hex)"
      />
      <label class="swatch swatch-custom" title="Custom" :aria-pressed="!known" :style="known ? undefined : { background: value }">
        <input type="color" :value="value" :aria-label="`${ROW_LABELS[name]}: custom colour`" @input="$emit('change', ($event.target as HTMLInputElement).value)" />
      </label>
    </div>
  </div>
</template>
