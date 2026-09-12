/**
 * Gallery entry point.
 *
 * Stylesheet order matters: the library's base sheet first, then the themes,
 * so the token layer is in place before any component paints.
 *
 * Every theme file is loaded up front. Because each one is self-contained —
 * it restates the whole token contract rather than relying on another file —
 * all of them can coexist, and switching a theme is nothing more than changing
 * the two attributes on <html>.
 */
import { createApp } from 'vue'
import { JinUI } from '@aeroscis/jin'
import '@aeroscis/jin/styles.css'
import '@aeroscis/jin/themes/jin.css'
import '@aeroscis/jin/themes/jin.dark.css'
import '@aeroscis/jin/themes/dimensional-layering.css'
import '@aeroscis/jin/themes/dimensional-layering.dark.css'
import '@aeroscis/jin/themes/brutalism.css'
import '@aeroscis/jin/themes/brutalism.dark.css'
import './gallery.css'
import App from './App.vue'
import { installCapabilities } from './host/capabilities'
import { loadPreferences, savePreferences } from './host/preferences'

const app = createApp(App)
const capabilities = installCapabilities()

app.use(JinUI, {
  // Capabilities come from the shell when present, and are simply absent in a
  // browser — which is exactly the intended degradation path.
  capabilities,
  theme: {
    // Style and mode survive a reload; this is the application's job, not the
    // library's own job.
    ...loadPreferences(),
    onChange: (snapshot) => savePreferences(snapshot),
  },
})

// No `t`: the library's readable English defaults are what a developer
// browsing components wants to see. The Gallery demonstrates the default path.
app.mount('#app')
