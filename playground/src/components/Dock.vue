<script setup lang="ts">
import { RobotHead, robotHeadShapes, type RobotHeadShape } from 'robot-heads-vue';
import { query, shapeLabels, type Colors } from '../constants';

defineProps<{ shape: RobotHeadShape; colors: Colors; antenna: boolean }>();
defineEmits<{ change: [shape: RobotHeadShape] }>();
const paused = query.has('paused');
</script>

<template>
  <nav class="dock" aria-label="Shape">
    <button
      v-for="s in robotHeadShapes"
      :key="s"
      class="dock-item"
      :aria-pressed="s === shape"
      :aria-label="shapeLabels[s]"
      @click="$emit('change', s)"
    >
      <span class="dock-icon">
        <RobotHead :shape="s" :size="52" :interactive="false" :floor-shadow="false" :antenna="antenna" :paused="paused" aria-hidden="true" v-bind="colors" />
      </span>
      <span class="dock-tip">{{ shapeLabels[s] }}</span>
    </button>
  </nav>
</template>
