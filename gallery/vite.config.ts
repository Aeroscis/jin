import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * The Gallery consumes the library as a `file:` dependency so its SFC sources
 * are compiled by this Vite instance.
 *
 * Two settings are mandatory for that to work:
 *   - resolve.dedupe: the linked library must not bring a second Vue instance
 *   - server.fs.allow: the dev server must be allowed to read files outside
 *     the Gallery root, because the library lives one directory up
 *
 * Alias order matters: the sub-path aliases come first. A plain string alias
 * matches at a path boundary, so listing `jin-ui` first would swallow
 * `jin-ui/themes/...` and resolve it inside the library entry file.
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ['vue'],
    alias: [
      // Point straight at the library sources during development.
      { find: 'jin-ui/styles', replacement: fileURLToPath(new URL('../src/styles/jin.css', import.meta.url)) },
      { find: 'jin-ui/themes', replacement: fileURLToPath(new URL('../themes', import.meta.url)) },
      { find: 'jin-ui/contracts', replacement: fileURLToPath(new URL('../contracts', import.meta.url)) },
      { find: 'jin-ui', replacement: fileURLToPath(new URL('../src/index.ts', import.meta.url)) },
    ],
  },
  server: {
    port: 5180,
    strictPort: false,
    fs: {
      // Allow serving the library and its contracts from the parent directory.
      allow: [fileURLToPath(new URL('..', import.meta.url))],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Tauri expects a relative asset base.
    target: 'esnext',
  },
  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_'],
})
