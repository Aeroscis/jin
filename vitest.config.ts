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
  },
})
