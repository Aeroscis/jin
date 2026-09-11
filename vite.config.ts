import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

/**
 * Optional publish artifact: ESM + d.ts + component CSS.
 * Development consumption is source-based (`file:` dependency), so this build
 * is not on the critical path of either application.
 */
export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/**/*.spec.ts'],
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
      // Emit declarations flat against dist/ (index.d.ts, components/…) rather
      // than under dist/src/, so `types` resolves the way consumers expect.
      entryRoot: 'src',
      rollupTypes: false,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'jin.js',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        assetFileNames: (asset) => (asset.names?.some((n) => n.endsWith('.css')) ? 'jin.css' : 'assets/[name][extname]'),
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
})
