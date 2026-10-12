import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [vue()],
  resolve: {
    // the playground runs on the library's source, so edits to it hot-reload here
    alias: { 'robot-heads-vue': fileURLToPath(new URL('../src/index.ts', import.meta.url)) },
    dedupe: ['vue'],
  },
  build: { outDir: '../dist-playground', emptyOutDir: true },
});
