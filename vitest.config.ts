import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // Pure logic runs in node; component tests opt into jsdom with a
    // `// @vitest-environment jsdom` docblock (see tests/components.spec.ts).
    environment: 'node',
    include: ['tests/**/*.spec.ts'],
    globals: false,
    // CSS is stubbed away for speed by default. The portal contract test reads
    // the real sheet (`?raw`) to pin the rule that anchors the portal to the
    // viewport, so that one file is processed instead of stubbed.
    css: { include: [/jin\.css/] },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**'],
      // src/core is the part that can be tested without a browser, so it is
      // also the part held to a floor. Components and composables are covered
      // opportunistically (jsdom measures no layout); the number to protect
      // is the decision layer's. Current levels: ~85 lines / ~76 branches /
      // ~86 functions / ~88 statements — the floors sit ~5pp below so an
      // unrelated change does not trip them, and they only move up.
      thresholds: {
        'src/core/**': { lines: 80, functions: 80, branches: 70, statements: 80 },
      },
    },
  },
})
