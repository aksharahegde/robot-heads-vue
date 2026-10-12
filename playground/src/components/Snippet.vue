<script setup lang="ts">
import { computed, watch } from 'vue';
import type { PropLine } from '../constants';

const props = defineProps<{ lines: PropLine[] }>();

/* a closing line keeps its last value while it folds away: each open line's value is remembered */
const last: Record<string, PropLine> = {};
watch(
  () => props.lines.map((l) => ({ ...l })),
  (ls) => ls.forEach((l) => l.on && (last[l.key] = l)),
  { immediate: true, flush: 'sync' }
);
const shown = computed(() => props.lines.map((l) => ({ line: l.on ? l : last[l.key] ?? l, on: l.on })));
</script>

<template>
  <pre class="code"><code><span class="code-line"><span class="tok-punct">&lt;</span><span class="tok-tag">RobotHead</span></span><span v-for="{ line, on } in shown" :key="line.key" class="code-prop" :data-open="on"><span class="code-prop-inner">{{ '  ' }}<span class="tok-attr">{{ typeof line.value === 'string' ? line.name : `:${line.name}` }}</span><span class="tok-punct">=</span><span class="tok-string">"{{ line.value }}"</span></span></span><span class="code-line tok-punct">/&gt;</span></code></pre>
</template>
