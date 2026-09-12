import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * The Gallery consumes the library as a `file:` dependency, compiled by this
 * Vite instance rather than taken from the library's build output — so an edit
 * to the library shows up here with no rebuild step.
 *
 * Three settings are what that needs, and none is optional:
 *   - resolve.conditions: `source` picks the library's own `.ts`/`.css` entries
 *     out of its `exports` map instead of `dist/`. One line, and it replaces the
 *     four-entry alias list this file used to carry — an alias list whose order
 *     was load-bearing, because a bare `@aeroscis/jin` alias matches at a path boundary
 *     and swallows `@aeroscis/jin/themes/...` when it is listed first.
 *   - resolve.dedupe: the linked library imports `vue` from its own directory,
 *     which would be a second Vue instance; dedupe keeps one.
 *   - server.fs.allow: the dev server refuses to read files outside the project
 *     root, and the library lives one directory up.
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    conditions: ['source'],
    dedupe: ['vue'],
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
