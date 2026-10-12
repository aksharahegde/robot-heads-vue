import { onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';

export type Theme = 'dark' | 'light';

export function useStageSize() {
  const measure = () => {
    const w = window.innerWidth, h = window.innerHeight;
    /* the size is the resting robot itself; its hops reach past it */
    if (w < 900) return Math.max(160, Math.min(w - 96, 260));
    /* centred on the screen, so it keeps the controls' width clear on both sides */
    const room = Math.min(w - 2 * (300 + 40 + 40), h - 300);
    return Math.round(Math.max(170, Math.min(room * 0.62, 330)));
  };
  const size = ref(measure());
  const on = () => (size.value = measure());
  onMounted(() => window.addEventListener('resize', on));
  onBeforeUnmount(() => window.removeEventListener('resize', on));
  return size;
}

export function useTheme() {
  const theme = ref<Theme>(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  watchEffect(() => {
    document.documentElement.dataset.theme = theme.value;
  });
  const toggle = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('robot-heads-theme', theme.value);
    } catch {
      /* private mode: the choice lasts the visit */
    }
  };
  return { theme, toggle };
}

export function useCopy() {
  const copied = ref<string | null>(null);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    copied.value = key;
    clearTimeout(timer);
    timer = setTimeout(() => (copied.value = null), 1400);
  };
  onBeforeUnmount(() => clearTimeout(timer));
  return { copied, copy };
}
