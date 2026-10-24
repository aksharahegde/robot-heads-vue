import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

/* builds the library; the playground in playground/ has its own config */
export default defineConfig({
  plugins: [dts({ include: ['src'], rollupTypes: true, tsconfigPath: './tsconfig.json' })],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: { external: ['vue'] },
  },
  test: { environment: 'jsdom', include: ['tests/**/*.test.ts'] },
});
