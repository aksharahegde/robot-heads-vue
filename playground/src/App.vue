<script setup lang="ts">
import { computed, ref } from 'vue';
import { RobotHead, robotHeadShapes, robotHeadStates, type RobotHeadShape, type RobotHeadState } from 'robot-heads-vue';
import { DEFAULTS, SPEEDS, SWATCHES, propText, query, stateHints, title, type Colors, type PropLine } from './constants';
import { useCopy, useStageSize, useTheme } from './composables';
import Dock from './components/Dock.vue';
import Swatches from './components/Swatches.vue';
import Snippet from './components/Snippet.vue';
import ThemeToggle from './components/ThemeToggle.vue';

const qState = query.get('state') as RobotHeadState | null;
const qShape = query.get('shape') as RobotHeadShape | null;
const state = ref<RobotHeadState>(qState && robotHeadStates.includes(qState) ? qState : 'idle');
const shape = ref<RobotHeadShape>(qShape && robotHeadShapes.includes(qShape) ? qShape : 'rectangle');
const colors = ref<Colors>({ ...DEFAULTS });
const speed = ref(1);
const antenna = ref(!query.has('noantenna'));
const paused = ref(query.has('paused'));
const { copied, copy } = useCopy();
const { theme, toggle: toggleTheme } = useTheme();
const size = useStageSize();

function setShape(s: RobotHeadShape) {
  shape.value = s;
  const u = new URL(location.href);
  u.searchParams.set('shape', s);
  history.replaceState(null, '', u);
}

function reset() {
  colors.value = { ...DEFAULTS };
  speed.value = 1;
  antenna.value = true;
  paused.value = false;
}

const changed = computed(
  () => (Object.keys(DEFAULTS) as Array<keyof Colors>).some((k) => colors.value[k] !== DEFAULTS[k]) || speed.value !== 1 || paused.value || !antenna.value
);
const lines = computed<PropLine[]>(() => [
  { key: 'shape', name: 'shape', value: shape.value, on: true },
  { key: 'state', name: 'state', value: state.value, on: true },
  { key: 'color', name: 'color', value: colors.value.color, on: colors.value.color !== DEFAULTS.color },
  { key: 'trimColor', name: 'trim-color', value: colors.value.trimColor, on: colors.value.trimColor !== DEFAULTS.trimColor },
  { key: 'screenColor', name: 'screen-color', value: colors.value.screenColor, on: colors.value.screenColor !== DEFAULTS.screenColor },
  { key: 'speed', name: 'speed', value: speed.value, on: speed.value !== 1 },
  { key: 'antenna', name: 'antenna', value: antenna.value, on: !antenna.value },
]);
const snippet = computed(() => `<RobotHead\n${lines.value.filter((l) => l.on).map((l) => `  ${propText(l)}\n`).join('')}/>`);
const colorKeys = Object.keys(SWATCHES) as Array<keyof Colors>;
</script>

<template>
  <div class="app">
    <Dock :shape="shape" :colors="colors" :antenna="antenna" @change="setShape" />

    <header class="masthead">
      <div class="byline">
        <span class="name">robot-heads-vue</span>
        <span class="by">port of robot-heads by</span>
        <a class="author" href="https://x.com/fayazara" target="_blank" rel="noopener noreferrer">
          <img src="https://github.com/fayazara.png?size=64" alt="" width="24" height="24" />
          Fayaz Ahmed
        </a>
      </div>
      <div class="masthead-end">
        <button class="install" @click="copy('install', 'npm i robot-heads-vue')">
          npm i robot-heads-vue
          <span class="install-copy">{{ copied === 'install' ? 'Copied' : 'Copy' }}</span>
        </button>
        <a class="icon-link" href="https://github.com/fayazara/robot-heads" target="_blank" rel="noopener noreferrer" aria-label="robot-heads on GitHub" title="GitHub">
          <!-- Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE -->
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2" />
          </svg>
        </a>
        <ThemeToggle :theme="theme" @toggle="toggleTheme" />
      </div>
    </header>

    <main class="stage" aria-label="Preview">
      <RobotHead :shape="shape" :state="state" :size="size" :paused="paused" :speed="speed" :antenna="antenna" v-bind="colors" />
      <div class="caption">
        <h1 class="font-bold">{{ title(state) }}</h1>
        <p>{{ stateHints[state] }}</p>
      </div>
    </main>

    <aside class="controls" aria-label="Controls">
      <Swatches v-for="key in colorKeys" :key="key" :name="key" :value="colors[key]" @change="(v) => (colors = { ...colors, [key]: v })" />

      <div class="control">
        <div class="control-head"><span class="control-label">Antenna</span></div>
        <div class="segments" role="group" aria-label="Antenna">
          <button v-for="v in [true, false]" :key="String(v)" class="segment" :aria-pressed="v === antenna" @click="antenna = v">{{ v ? 'On' : 'Off' }}</button>
        </div>
      </div>

      <div class="control">
        <div class="control-head">
          <span class="control-label">Speed</span>
          <button class="text-button" @click="paused = !paused">{{ paused ? 'Play' : 'Pause' }}</button>
        </div>
        <div class="segments" role="group" aria-label="Speed">
          <button v-for="v in SPEEDS" :key="v" class="segment" :aria-pressed="v === speed" @click="speed = v">{{ v }}×</button>
        </div>
      </div>

      <div class="control">
        <div class="control-head">
          <span class="control-label">Usage</span>
          <span class="control-actions">
            <button class="text-button reset" :aria-hidden="!changed" :tabindex="changed ? 0 : -1" @click="reset">Reset</button>
            <button class="text-button" @click="copy('snippet', snippet)">{{ copied === 'snippet' ? 'Copied' : 'Copy' }}</button>
          </span>
        </div>
        <Snippet :lines="lines" />
      </div>
    </aside>

    <nav class="states" aria-label="State">
      <button v-for="s in robotHeadStates" :key="s" class="state" :aria-pressed="s === state" @click="state = s">
        <span class="state-head">
          <RobotHead :shape="shape" :state="s" :size="72" :paused="paused" :speed="speed" :antenna="antenna" :interactive="false" aria-hidden="true" v-bind="colors" />
        </span>
        <span class="state-name">{{ title(s) }}</span>
      </button>
    </nav>
  </div>
</template>
